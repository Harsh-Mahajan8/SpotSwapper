import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to format event for response
const formatEvent = (event) => ({
    id: event._id.toString(),
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    status: event.status,
    userId: event.userId.toString(),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
});

// Get all swappable slots from other users
router.get('/swappable-slots', authenticate, async (req, res) => {
    try {
        // Convert user.id to ObjectId for proper comparison
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        const swappableSlots = await Event.find({
            status: 'SWAPPABLE',
            userId: { $ne: userId }, // Exclude user's own slots - only from OTHER users
        })
            .populate('userId', 'name email')
            .sort({ startTime: 1 });

        console.log(`[GET /swappable-slots] User ${req.user.id} found ${swappableSlots.length} swappable slots from other users`);

        const formattedSlots = swappableSlots.map(slot => ({
            ...formatEvent(slot),
            user: {
                id: slot.userId._id.toString(),
                name: slot.userId.name,
                email: slot.userId.email,
            },
        }));

        res.json(formattedSlots);
    } catch (error) {
        console.error('Get swappable slots error:', error);
        res.status(500).json({ error: 'Failed to fetch swappable slots' });
    }
});

// Create a new swap request
router.post(
    '/swap-request',
    authenticate,
    [
        body('mySlotId').notEmpty().withMessage('My slot ID is required'),
        body('theirSlotId').notEmpty().withMessage('Their slot ID is required'),
    ],
    async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ errors: errors.array() });
            }

            const { mySlotId, theirSlotId } = req.body;

            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(mySlotId) || !mongoose.Types.ObjectId.isValid(theirSlotId)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Invalid slot ID' });
            }

            // Get both slots
            const mySlot = await Event.findById(mySlotId).session(session);
            const theirSlot = await Event.findById(theirSlotId).session(session);

            if (!mySlot || !theirSlot) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ error: 'One or both slots not found' });
            }

            // Verify mySlot belongs to requester (using ObjectId comparison)
            const requesterId = new mongoose.Types.ObjectId(req.user.id);
            if (mySlot.userId.toString() !== requesterId.toString()) {
                await session.abortTransaction();
                session.endSession();
                return res.status(403).json({ error: 'You can only swap your own slots' });
            }

            // Verify both slots are SWAPPABLE (CRITICAL: Must be SWAPPABLE)
            if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ 
                    error: 'Both slots must be SWAPPABLE to create a swap request. One or both slots may already be in a pending swap.' 
                });
            }

            // Check if slots belong to different users (cannot swap with yourself)
            if (mySlot.userId.toString() === theirSlot.userId.toString()) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Cannot swap your own slots' });
            }

            // Check if there's already a pending request for these slots
            const existingRequest = await SwapRequest.findOne({
                $or: [
                    {
                        requesterSlotId: mySlotId,
                        responderSlotId: theirSlotId,
                    },
                    {
                        requesterSlotId: theirSlotId,
                        responderSlotId: mySlotId,
                    },
                ],
                status: 'PENDING',
            }).session(session);

            if (existingRequest) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'A pending swap request already exists for these slots' });
            }

            // Update both slots to SWAP_PENDING (prevents them from appearing in marketplace)
            await Event.findByIdAndUpdate(mySlotId, { status: 'SWAP_PENDING' }, { session, new: true });
            await Event.findByIdAndUpdate(theirSlotId, { status: 'SWAP_PENDING' }, { session, new: true });

            console.log(`[POST /swap-request] Creating swap request: User ${req.user.id} wants to swap slot ${mySlotId} with slot ${theirSlotId} owned by ${theirSlot.userId}`);

            // Create swap request
            // Ensure responderId is properly set as ObjectId
            const responderIdObj = new mongoose.Types.ObjectId(theirSlot.userId);
            
            const swapRequestData = {
                requesterId: requesterId,
                responderId: responderIdObj,
                requesterSlotId: new mongoose.Types.ObjectId(mySlotId),
                responderSlotId: new mongoose.Types.ObjectId(theirSlotId),
                status: 'PENDING',
            };
            const swapRequest = await SwapRequest.create([swapRequestData], { session });
            
            console.log(`[POST /swap-request] Swap request created: ${swapRequest[0]._id}`);

            await session.commitTransaction();
            session.endSession();

            // Populate and format response (create with array returns array)
            const populatedRequest = await SwapRequest.findById(swapRequest[0]._id)
                .populate('requesterId', 'name email')
                .populate('responderId', 'name email')
                .populate('requesterSlotId')
                .populate('responderSlotId');

            const result = {
                id: populatedRequest._id.toString(),
                requesterId: populatedRequest.requesterId._id.toString(),
                responderId: populatedRequest.responderId._id.toString(),
                requesterSlotId: populatedRequest.requesterSlotId._id.toString(),
                responderSlotId: populatedRequest.responderSlotId._id.toString(),
                status: populatedRequest.status,
                createdAt: populatedRequest.createdAt,
                updatedAt: populatedRequest.updatedAt,
                requesterSlot: formatEvent(populatedRequest.requesterSlotId),
                responderSlot: formatEvent(populatedRequest.responderSlotId),
                requester: {
                    id: populatedRequest.requesterId._id.toString(),
                    name: populatedRequest.requesterId.name,
                    email: populatedRequest.requesterId.email,
                },
                responder: {
                    id: populatedRequest.responderId._id.toString(),
                    name: populatedRequest.responderId.name,
                    email: populatedRequest.responderId.email,
                },
            };

            res.status(201).json(result);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('Create swap request error:', error);
            res.status(500).json({ error: 'Failed to create swap request' });
        }
    }
);

// Respond to a swap request (accept or reject)
router.post(
    '/swap-response/:id',
    authenticate,
    [
        body('action').isIn(['accept', 'reject']).withMessage('Action must be either accept or reject'),
    ],
    async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const { action } = req.body;

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Invalid request ID' });
            }

            // Get swap request
            const swapRequest = await SwapRequest.findById(id)
                .populate('requesterSlotId')
                .populate('responderSlotId')
                .session(session);

            if (!swapRequest) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ error: 'Swap request not found' });
            }

            // Verify responder is the logged-in user (must be the one receiving the request)
            const responderId = new mongoose.Types.ObjectId(req.user.id);
            if (swapRequest.responderId.toString() !== responderId.toString()) {
                await session.abortTransaction();
                session.endSession();
                return res.status(403).json({ error: 'Not authorized to respond to this request' });
            }

            // Verify request is still pending
            if (swapRequest.status !== 'PENDING') {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Swap request has already been processed' });
            }

            if (action === 'accept') {
                // Accept: Swap the userIds of both slots and set status to BUSY
                // This is the critical transaction - exchange ownership
                const requesterIdObj = new mongoose.Types.ObjectId(swapRequest.requesterId);
                const responderIdObj = new mongoose.Types.ObjectId(swapRequest.responderId);

                console.log(`[POST /swap-response/${id}] Accepting swap: Exchanging ownership`);
                console.log(`  Requester slot ${swapRequest.requesterSlotId._id} → going to responder ${responderIdObj}`);
                console.log(`  Responder slot ${swapRequest.responderSlotId._id} → going to requester ${requesterIdObj}`);

                // Requester's slot goes to responder
                await Event.findByIdAndUpdate(
                    swapRequest.requesterSlotId._id,
                    {
                        userId: responderIdObj,
                        status: 'BUSY',
                    },
                    { session, new: true }
                );

                // Responder's slot goes to requester
                await Event.findByIdAndUpdate(
                    swapRequest.responderSlotId._id,
                    {
                        userId: requesterIdObj,
                        status: 'BUSY',
                    },
                    { session, new: true }
                );

                // Update swap request status to ACCEPTED
                await SwapRequest.findByIdAndUpdate(
                    id,
                    { status: 'ACCEPTED' },
                    { session, new: true }
                );

                console.log(`[POST /swap-response/${id}] Swap accepted successfully`);

                await session.commitTransaction();
                session.endSession();

                // Populate and format response
                const updatedRequest = await SwapRequest.findById(id)
                    .populate('requesterId', 'name email')
                    .populate('responderId', 'name email')
                    .populate('requesterSlotId')
                    .populate('responderSlotId');

                const result = {
                    id: updatedRequest._id.toString(),
                    requesterId: updatedRequest.requesterId._id.toString(),
                    responderId: updatedRequest.responderId._id.toString(),
                    requesterSlotId: updatedRequest.requesterSlotId._id.toString(),
                    responderSlotId: updatedRequest.responderSlotId._id.toString(),
                    status: updatedRequest.status,
                    createdAt: updatedRequest.createdAt,
                    updatedAt: updatedRequest.updatedAt,
                    requesterSlot: formatEvent(updatedRequest.requesterSlotId),
                    responderSlot: formatEvent(updatedRequest.responderSlotId),
                    requester: {
                        id: updatedRequest.requesterId._id.toString(),
                        name: updatedRequest.requesterId.name,
                        email: updatedRequest.requesterId.email,
                    },
                    responder: {
                        id: updatedRequest.responderId._id.toString(),
                        name: updatedRequest.responderId.name,
                        email: updatedRequest.responderId.email,
                    },
                };

                res.json(result);
            } else {
                // Reject: Revert both slots back to SWAPPABLE status
                console.log(`[POST /swap-response/${id}] Rejecting swap: Reverting slots to SWAPPABLE`);
                
                await Event.findByIdAndUpdate(
                    swapRequest.requesterSlotId._id,
                    { status: 'SWAPPABLE' },
                    { session, new: true }
                );

                await Event.findByIdAndUpdate(
                    swapRequest.responderSlotId._id,
                    { status: 'SWAPPABLE' },
                    { session, new: true }
                );

                // Update swap request status to REJECTED
                await SwapRequest.findByIdAndUpdate(
                    id,
                    { status: 'REJECTED' },
                    { session, new: true }
                );

                console.log(`[POST /swap-response/${id}] Swap rejected successfully`);

                await session.commitTransaction();
                session.endSession();

                // Populate and format response
                const updatedRequest = await SwapRequest.findById(id)
                    .populate('requesterId', 'name email')
                    .populate('responderId', 'name email')
                    .populate('requesterSlotId')
                    .populate('responderSlotId');

                const result = {
                    id: updatedRequest._id.toString(),
                    requesterId: updatedRequest.requesterId._id.toString(),
                    responderId: updatedRequest.responderId._id.toString(),
                    requesterSlotId: updatedRequest.requesterSlotId._id.toString(),
                    responderSlotId: updatedRequest.responderSlotId._id.toString(),
                    status: updatedRequest.status,
                    createdAt: updatedRequest.createdAt,
                    updatedAt: updatedRequest.updatedAt,
                    requesterSlot: formatEvent(updatedRequest.requesterSlotId),
                    responderSlot: formatEvent(updatedRequest.responderSlotId),
                    requester: {
                        id: updatedRequest.requesterId._id.toString(),
                        name: updatedRequest.requesterId.name,
                        email: updatedRequest.requesterId.email,
                    },
                    responder: {
                        id: updatedRequest.responderId._id.toString(),
                        name: updatedRequest.responderId.name,
                        email: updatedRequest.responderId.email,
                    },
                };

                res.json(result);
            }
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('Respond to swap request error:', error);
            res.status(500).json({ error: 'Failed to process swap response' });
        }
    }
);

// Get incoming swap requests (requests where user is the responder)
router.get('/requests/incoming', authenticate, async (req, res) => {
    try {
        const incomingRequests = await SwapRequest.find({
            responderId: req.user.id,
        })
            .populate('requesterId', 'name email')
            .populate('responderId', 'name email')
            .populate('requesterSlotId')
            .populate('responderSlotId')
            .sort({ createdAt: -1 });

        const formattedRequests = incomingRequests.map(request => ({
            id: request._id.toString(),
            requesterId: request.requesterId._id.toString(),
            responderId: request.responderId._id.toString(),
            requesterSlotId: request.requesterSlotId._id.toString(),
            responderSlotId: request.responderSlotId._id.toString(),
            status: request.status,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
            requesterSlot: formatEvent(request.requesterSlotId),
            responderSlot: formatEvent(request.responderSlotId),
            requester: {
                id: request.requesterId._id.toString(),
                name: request.requesterId.name,
                email: request.requesterId.email,
            },
            responder: {
                id: request.responderId._id.toString(),
                name: request.responderId.name,
                email: request.responderId.email,
            },
        }));

        res.json(formattedRequests);
    } catch (error) {
        console.error('Get incoming requests error:', error);
        res.status(500).json({ error: 'Failed to fetch incoming requests' });
    }
});

// Get outgoing swap requests (requests where user is the requester)
router.get('/requests/outgoing', authenticate, async (req, res) => {
    try {
        const outgoingRequests = await SwapRequest.find({
            requesterId: req.user.id,
        })
            .populate('requesterId', 'name email')
            .populate('responderId', 'name email')
            .populate('requesterSlotId')
            .populate('responderSlotId')
            .sort({ createdAt: -1 });

        const formattedRequests = outgoingRequests.map(request => ({
            id: request._id.toString(),
            requesterId: request.requesterId._id.toString(),
            responderId: request.responderId._id.toString(),
            requesterSlotId: request.requesterSlotId._id.toString(),
            responderSlotId: request.responderSlotId._id.toString(),
            status: request.status,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
            requesterSlot: formatEvent(request.requesterSlotId),
            responderSlot: formatEvent(request.responderSlotId),
            requester: {
                id: request.requesterId._id.toString(),
                name: request.requesterId.name,
                email: request.requesterId.email,
            },
            responder: {
                id: request.responderId._id.toString(),
                name: request.responderId.name,
                email: request.responderId.email,
            },
        }));

        res.json(formattedRequests);
    } catch (error) {
        console.error('Get outgoing requests error:', error);
        res.status(500).json({ error: 'Failed to fetch outgoing requests' });
    }
});

export default router;
