// This model records the servers local relative filepath of a given media object, in particular videos

const mongoose = require('mongoose');

const MediaSchema = mongoose.Schema(
    {
        "filePath": {
            type: String,
            isRequired: true,
            default: ""
        },
        "artifactID": {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'artifact',
            default : null
        }
    }
);

// Export as a mongoose model which will be stored in a collection called media
const Media = mongoose.model("media", MediaSchema);
module.exports =  Media;