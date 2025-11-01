import mongoose from 'mongoose';

const swapRequestStatusEnum = ['PENDING', 'ACCEPTED', 'REJECTED'];

const swapRequestSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    responderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requesterSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    responderSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    status: {
        type: String,
        enum: swapRequestStatusEnum,
        default: 'PENDING',
    },
}, {
    timestamps: true,
});

// Indexes for better query performance
swapRequestSchema.index({ requesterId: 1 });
swapRequestSchema.index({ responderId: 1 });
swapRequestSchema.index({ status: 1 });

export default mongoose.model('SwapRequest', swapRequestSchema);

