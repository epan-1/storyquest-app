const mongoose = require('mongoose');

// Artifact attributes

const ArtifactSchema = mongoose.Schema(
    {
        "serialNumber": {
            type: String,
            isRequired: true
        },
        "name": {
            type: String,
            isRequired: true
        },
        "story": String,
        "keywords": String,
        // Should we define a basic list of categories? if so
        // "category": {type: String, enum: enums.categories},
        "category": String,
        // ownerID + collectionID allows you to add multiple owners and collections
        // [{ }] - represents a list of objects
        "ownerID": [{type: mongoose.Schema.Types.ObjectId, ref: 'user',default : null}],
        // the default value for collectionID is null, as an artifact does not need to be
        // part of a collection
        "collectionID": [{type: mongoose.Schema.Types.ObjectId, ref: 'collection',default : null}],
        "isPublic" : {
            type: String,
            enum: ['private', 'friends', 'public'],
            isRequired: true,
            default: 'private'
        },
        "dateCreated" : {
            type: Date,
            default: Date.now
        }
    }
);

ArtifactSchema.index({
    name: 'text', 
    story: 'text', 
    keywords: 'text'
}, {
    weights: {
        name: 5, 
        keywords: 3, 
        story: 2
    }
});

const Artifact = mongoose.model('Artifact', ArtifactSchema);
module.exports =  Artifact;