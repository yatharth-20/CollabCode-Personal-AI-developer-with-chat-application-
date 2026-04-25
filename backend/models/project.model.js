import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name : {
        type : String,
        lowercase : true,
        required : true,
        trim : true,
        unique : [true, 'Project name must be unique'],
    },

    users : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        }
    ],

    fileTree: {
        type: Object,
        default: {}
    },
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    aiMessages: [
        {
            role: { type: String, required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
})


const Project =  mongoose.model('project', projectSchema);

export default Project;
