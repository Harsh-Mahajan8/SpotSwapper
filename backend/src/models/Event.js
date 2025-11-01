import mongoose from 'mongoose';

const eventStatusEnum = ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'];

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: eventStatusEnum,
        default: 'BUSY',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// Validate endTime is after startTime
eventSchema.pre('save', function (next) {
    if (this.endTime <= this.startTime) {
        next(new Error('End time must be after start time'));
    } else {
        next();
    }
});

export default mongoose.model('Event', eventSchema);

