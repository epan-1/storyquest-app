// This file contains the routes that the server backend will provide regarding all artifact actions

const express = require("express");
const router = express.Router();
const Artifact = require("../../models/Artifact");
const User = require("../../models/User");
const Media = require("../../models/Media");
const imgStore = require('../../storageEngines/imageStorageEngine');
const vidStore = require('../../storageEngines/videoStorageEngine');
const decrypt = require('../../config/encryption').decrypt;

// Imports required for securing the routes. Allows passport to verify the JWT sent by the client.
const passport = require('passport');
require("../../config/passport")(passport);
const passportOpts = {
    session: false
};

// @route GET /artifacts
// @desc View all public artifacts
// @access Public
router.get('/artifacts', function (req, res) {
    Artifact.find({isPublic: "public"}, function (err, artifact) {
        if (!err) {
            res.send(artifact);
        } else {
            res.status(404).send("Unable to retrieve any artifacts. Please try again later or contact the site admin.");
        }
    });
});

// @route POST /searchartifacts
// @desc Returns artifacts that match the keywords specified by the search
// @access Public but only returns public artifacts. If user is logged in will return their own artifacts as well.
router.post('/searchartifacts', function(req, res, next) {
    passport.authenticate('jwt', passportOpts, (err, user, info) => {
        if (err) {
            return next(err);
        }

        // If it is a guest or unregsitered user, they are only allowed to search for public artifacts
        if (!user) {
            Artifact.find({$text: { $search: req.body.searchString }, isPublic: "public"}, {score: { $meta: `textScore` }} )
                .sort({score: {$meta: `textScore`}})
                .exec(function(err, artifacts) {
                    if (err) {
                        return res.status(400).send("Error: Search function has failed. Try again later.");
                    }
                    return res.send(artifacts);
                });
        } else {
            // Otherwise they are allowed to search for public artifacts, plus the ones they have created or set to friend level privacy
            Artifact.find({$text: { $search: req.body.searchString }, $or: [ {isPublic: "private"}, {isPublic: "friends"}, {ownerID: user.id}] }, {score: { $meta: `textScore` }} )
                .sort({score: {$meta: `textScore`}})
                .exec(function (err, artifacts) {
                    if (err) {
                        return res.status(400).send("Error: Search function has failed. Try again later.");
                    }
                    return res.status(200).send(artifacts);
                });
        }
    })(req, res, next);
});

// This function generates a random string filled with 'characters' up to a specified 'length'
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 
// create new artifact
router.post('/newArtifact', (req, res, next) => {

    passport.authenticate('jwt', passportOpts, (err, user, info) => {
        const SERIAL_LENGTH = 6;

        if (err) { 
            return next(err); 
        }
        if (!user) { 
            return res.status(401).send("Unauthorised user"); 
        }

        // Map through each artifact that current exists, and extract the serial number. Then keep generating new serial numbers until you find a unique
        // one to assign
        Artifact.find({}, function(err, artifacts) {
            var artifactSerials = [];
            
            artifacts.forEach(function (artifact) {
                artifactSerials.push(artifact.serialNumber);
            });
            
            var id = makeid(SERIAL_LENGTH);
            var notUnique = true;

            while(notUnique) {
                if (!artifactSerials.includes(id)) {
                    notUnique = false;
                } else {
                    id = makeid(SERIAL_LENGTH);
                }
            }

            var newArtifact = new Artifact({
                "serialNumber": id,
                "name": req.body.name,
                "story": req.body.story,
                "tags": req.body.tags.join(' '),
                "category": req.body.category,
                "isPublic": req.body.isPublic,
                // Need to add check here to ensure .dateMade is not an empty string, if so then it was optional.
                "dateMade": req.body.dateMade,
                "ownerID": user.id
            });

            newArtifact.save(function (err, artifact) {
                if (!err) {
                    res.status(200).send(artifact);
                } else {
                    res.status(400).send(err);
                }
            });
        })
    })(req, res, next);
});

// @route GET /artifact/:artifactID
// @desc View a single artifact based on its unique database ID. Only the artifact owner and authorised users are allowed
//       to view via this URL.
// @access Restricted
router.get('/artifact/:artifactID', (req, res, next) => { 
    passport.authenticate('jwt', passportOpts, (err, user, info) => {

        var artifactID = req.params.artifactID;

        if (err) {
            return next(err);
        }

        Artifact.findById(artifactID, function(err, artifact) {
            if (err) {
                return res.status(400).send(err);
            }

            // Check that the artifact exists
            if (!artifact) {
                return res.status(404).send("Artifact not found.");
            }

            // Check if non-logged in user
            if (!user) {
                // Check if its not public
                if (artifact.isPublic !== 'public') {
                    return res.status(401).send("Unauthorised user. You are not allowed to view this resource.");
                } else {
                    return res.status(200).send(artifact);
                }
            }
            
            // Check if owner of the artifact, can view it regardless of privacy settings.
            if (artifact.ownerID.includes(user.id)) {
                return res.status(200).send(artifact);
            } else {
                // Check if it a known user to the owner of the artifact.
                User.findById(artifact.ownerID[0], function(err, owner) {

                    if (err) {
                        return res.status(400).send(err);
                    }

                    if (owner.knownUsers !== null && typeof(owner.knownUsers) !== "undefined") {
                        // Check to make sure it isn't null before accessing
                        if (owner.knownUsers.includes(user.email)) {
                            // Check the privacy setting
                            if (artifact.isPublic === 'friends') {
                                return res.status(200).send(artifact);
                            } else if (artifact.isPublic === 'public') {
                                return res.status(200).send(artifact);
                            } else {
                                return res.status(401).send("This artifact is private. Ask the owner to change the privacy.");
                            }
                        } else {
                            if (artifact.isPublic === 'public') {
                                return res.status(200).send(artifact);
                            } else {
                                return res.status(401).send("You are not the owner or a known user. So you are not allowed to view this resource.");
                            }
                        }
                    } else {
                        return res.status(401).send("You are not the owner or a known user. So you are not allowed to view this resource.");
                    }
                });
            }
        })
    })(req, res, next);
});

// @route DELETE /delete_artifact/:artifactID
// @desc View a single artifact based on its serial number.
// @access Restricted
router.delete('/delete_artifact/:artifactID', (req, res, next) => {

    passport.authenticate('jwt', passportOpts, (err, user, info) => {
        
        if (err) { 
            return next(err); 
        }
        if (!user) { 
            return res.status(401).send("Unauthorised user, you are not the owner of this artifact."); 
        }

        var artifactID = req.params.artifactID;
        Artifact.findOneAndDelete({_id:artifactID}, function(err, doc) {
            if(!err){
                res.status(200).send("Delete successful.");
            }else{
                res.status(400).send(err);
            }
        });
    })(req, res, next);
});

// @route GET /video/:iv/:enc
// @desc Views single video based on its object ID in MongoDB. Access is restricted as this video is only accessible on 
// the artifact page that it is on. 
// IV is the initialisation vector and ENC is the actual encrypted data. Both must be passed in the URL to correctly
// access the video
// @access Restricted
router.get('/video/:iv/:enc', (req, res) => {

    // Here are the encrypted parameters passed from the server to decrypt and
    // get the object ID of the video, thus preventing any access to videos even with knowledge
    // of the object ID as they would have to encrypt it first before it would be processed properly.
    try {
        const objID = decrypt({iv: req.params.iv, encryptedData: req.params.enc});
        // See if it's a local media object first
        Media.findById(objID, (err, media) => {
            if (err) {
                return res.status(500).send(err);
            }

            // Check if it exists in media collection
            if (media) {
                vidStore.streamLocalVideo(media.filePath, req, res);
            } else {
                vidStore.streamVideo(objID, req, res);
            }
        });
    } catch (err) {
        return res.sendStatus(401);
    }
});

// @route GET /artifact_images/:artifactID/:imageID
// A GET route that returns a base64 string for the given image ID. Artifact ID must also be supplied to check for
// user authentication as access to these images is restricted depending on user privacy settings.
router.get('/artifact_images/:artifactID/:imageID', (req, res, next) => {

    const artifactID = req.params.artifactID;
    const imageID = req.params.imageID;

    Artifact.findById(artifactID, (err, artifact) => {

        if (err) {
            return res.sendStatus(500);
        }

        if (!artifact) {
            return res.status(404).send("Error: This image is not associated with an artifact.");
        }

        passport.authenticate('jwt', passportOpts, (err, user, info) => {

            if (err) {
                return res.status(500).send(err);
            }

            // Read the image and determine whether or not send it depending on user authentication
            imgStore.readImage(imageID, function(err, imgData) {
                if (err) {
                    return res.status(500).send(err);
                }
                
                // Check if non-logged in user
                if (!user) {
                    // Check if its not public
                    if (artifact.isPublic !== 'public') {
                        return res.status(401).send("Unauthorised user. You are not allowed to view this resource.");
                    } else {
                        return res.status(200).send(imgData);
                    }
                }

                // Check if owner of the artifact, can view it regardless of privacy settings.
                if (artifact.ownerID.includes(user.id)) {
                    return res.status(200).send(imgData);
                } else {
                    // Check if it a known user to the owner of the artifact.
                    User.findById(artifact.ownerID[0], function(err, owner) {

                        if (err) {
                            return res.status(400).send(err);
                        }

                        if (owner.knownUsers !== null && typeof(owner.knownUsers) !== "undefined") {
                            // Check to make sure it isn't null before accessing
                            if (owner.knownUsers.includes(user.email)) {
                                // Check the privacy setting
                                if (artifact.isPublic === 'friends') {
                                    return res.status(200).send(imgData);
                                } else if (artifact.isPublic === 'public') {
                                    return res.status(200).send(imgData);
                                } else {
                                    return res.status(401).send("This artifact image is private. Ask the owner to change the privacy.");
                                }
                            } else {
                                if (artifact.isPublic === 'public') {
                                    return res.status(200).send(imgData);
                                } else {
                                    return res.status(401).send("You are not the owner or a known user. So you are not allowed to view this resource.");
                                }
                            }
                        } else {
                            return res.status(401).send("You are not the owner or a known user. So you are not allowed to view this resource.");
                        }
                    });
                }
            });
        })(req, res, next);
    });
});

module.exports = router;