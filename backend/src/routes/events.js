import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Event from '../models/Event.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all events for logged-in user
router.get('/', authenticate, async (req, res) => {
    try {
        const events = await Event.find({ userId: req.user.id })
            .sort({ startTime: 1 });

        // Convert MongoDB documents to plain objects with id field
        const eventsArray = events.map(event => ({
            id: event._id.toString(),
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            status: event.status,
            userId: event.userId.toString(),
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
        }));

        res.json(eventsArray);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Create new event
router.post(
    '/',
    authenticate,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
        body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 date'),
        body('status').optional().isIn(['BUSY', 'SWAPPABLE', 'SWAP_PENDING']).withMessage('Invalid status'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, startTime, endTime, status = 'BUSY' } = req.body;

            // Validate endTime is after startTime
            if (new Date(endTime) <= new Date(startTime)) {
                return res.status(400).json({ error: 'End time must be after start time' });
            }

            const event = await Event.create({
                title,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status,
                userId: req.user.id,
            });

            res.status(201).json({
                id: event._id.toString(),
                title: event.title,
                startTime: event.startTime,
                endTime: event.endTime,
                status: event.status,
                userId: event.userId.toString(),
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
            });
        } catch (error) {
            console.error('Create event error:', error);
            res.status(500).json({ error: 'Failed to create event' });
        }
    }
);

// Update event
router.put(
    '/:id',
    authenticate,
    [
        body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
        body('startTime').optional().isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
        body('endTime').optional().isISO8601().withMessage('End time must be a valid ISO 8601 date'),
        body('status').optional().isIn(['BUSY', 'SWAPPABLE', 'SWAP_PENDING']).withMessage('Invalid status'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid event ID' });
            }

            // Check if event belongs to user
            const existingEvent = await Event.findById(id);

            if (!existingEvent) {
                return res.status(404).json({ error: 'Event not found' });
            }

            if (existingEvent.userId.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Not authorized to update this event' });
            }

            const updateData = {};
            if (req.body.title) updateData.title = req.body.title;
            if (req.body.startTime) updateData.startTime = new Date(req.body.startTime);
            if (req.body.endTime) updateData.endTime = new Date(req.body.endTime);
            if (req.body.status) updateData.status = req.body.status;

            // Validate endTime is after startTime if both are provided
            const finalStartTime = updateData.startTime || existingEvent.startTime;
            const finalEndTime = updateData.endTime || existingEvent.endTime;
            if (new Date(finalEndTime) <= new Date(finalStartTime)) {
                return res.status(400).json({ error: 'End time must be after start time' });
            }

            const updatedEvent = await Event.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            res.json({
                id: updatedEvent._id.toString(),
                title: updatedEvent.title,
                startTime: updatedEvent.startTime,
                endTime: updatedEvent.endTime,
                status: updatedEvent.status,
                userId: updatedEvent.userId.toString(),
                createdAt: updatedEvent.createdAt,
                updatedAt: updatedEvent.updatedAt,
            });
        } catch (error) {
            console.error('Update event error:', error);
            res.status(500).json({ error: 'Failed to update event' });
        }
    }
);

export default router;
