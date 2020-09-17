const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model('Post');
const User = mongoose.model('User');

router.get('/user/:id', requireLogin, (req, res) => {
    User.findOne({ _id: req.params.id })
        .select('-password')
        .then((user) => {
            Post.find({ postedBy: req.params.id })
                .populate('postedBy', '_id username')
                .exec((err, posts) => {
                    if (err) {
                        return res.status(422).json({ error: err });
                    }
                    res.json({ user, posts });
                });
        })
        .catch((err) => {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        });
});

router.put('/follow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(
        req.body.followId,
        {
            $push: { followers: req.user._id },
        },
        {
            new: true,
        },
        (err, result) => {
            if (err) {
                return res.status(422).json({ error: err });
            }
            User.findByIdAndUpdate(
                req.user._id,
                {
                    $push: { following: req.user.followId },
                },
                { new: true },
            )
                .select('-password')
                .then((result) => {
                    res.json(result);
                })
                .catch((err) => {
                    return res.status(422).json({ error: err });
                });
        },
    );
});

router.put('/unfollow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(
        req.body.unfollowId,
        {
            $pull: { followers: req.user._id },
        },
        {
            new: true,
        },
        (err, result) => {
            if (err) {
                return res.status(422).json({ error: err });
            }
            User.findByIdAndUpdate(
                req.user._id,
                {
                    $pull: { following: req.user.unfollowId },
                },
                { new: true },
            )
                .select('-password')
                .then((result) => {
                    res.json(result);
                })
                .catch((err) => {
                    return res.status(422).json({ error: err });
                });
        },
    );
});

router.put('/updatepic', requireLogin, (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        { $set: { pic: req.body.pic } },
        { new: true },
        (err, result) => {
            if (err) {
                return res
                    .status(422)
                    .json({ error: 'Tải ảnh lên không thành công' });
            }
            res.json(result);
        },
    );
});
module.exports = router;