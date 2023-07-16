const fs = require('fs');
const jwt = require('jsonwebtoken')
const Post = require('../models/Post')

const createPost = async (req, res) => {
    const {title, summary, content, thumbnail} = req.body;
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ error : 'You must be login'})
        return;
    }

    if (!title || !summary || !content) {
        res.status(400).end('title, summary and content can not be empty');
        return
    }
    if (title.length < 3 || title.length >= 100) {
        res.status(400).end('title should be greater than 3 characters and less than equals to 100 characters')
        return
    }
    if (summary.length < 30 || summary.length >= 300) {
        res.status(400).end('summary should be greater than 30 characters and less than equals to 300 characters')
        return
    }
    if (content.length < 30 || summary.length >= 50000) {
        res.status(400).end('content should be greater than 30 characters or your content is too large')
        return
    }

    try {
        const tokenInfo = jwt.verify(token, process.env.JWT_SECRET);

        const postDoc = await Post.create({
            title,
            summary,
            content,
            thumbnail,
            author: tokenInfo.id,
        })

        return res.status(201).json(postDoc)
    } catch (err) {
        return res.status(400).json({error : 'Invalid token'})
    }
}

const getPosts = async (req, res) => {
    const posts = await Post.find()
                    .populate('author', ['username'])
                    .sort({createdAt: -1})
                    .limit(20)

    let postResponse = [];
    for (let post of posts) {
        postResponse.push({
            id: post._id,
            title: post.title,
            summary: post.summary,
            author: post.author.username,
            updatedAt: post.updatedAt,
            thumbnail: post.thumbnail,
        })
    }

    res.status(200).json(postResponse);
}

const getPost = async (req, res) => {
    const {postId} = req.params;
    try {
        const postDoc = await Post.findById(postId).populate('author', ['username'])
        res.json(postDoc);
    } catch (err) {
        res.status(400).end('error occured')
    }
}

const updatePost = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ error : 'You must be login'})
        return;
    }

    const {title, summary, content, thumbnail} = req.body;

    if (!title || !summary || !content) {
        res.status(400).end('title, summary and content can not be empty');
        return
    }
    if (title.length < 3 || title.length >= 100) {
        res.status(400).end('title should be greater than 3 characters and less than equals to 100 characters')
        return
    }
    if (summary.length < 30 || summary.length >= 300) {
        res.status(400).end('summary should be greater than 30 characters and less than equals to 300 characters')
        return
    }
    if (content.length < 30 || summary.length >= 50000) {
        res.status(400).end('content should be greater than 30 characters or your content is too large')
        return
    }

    try {
        const tokenInfo = jwt.verify(token, process.env.JWT_SECRET);

        const {postId} = req.params;

        const postDoc = await Post.findById(postId);

        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(tokenInfo.id)
        
        if (!isAuthor) {
            throw 'you are not the author of the POST'
        }

        await postDoc.updateOne({
            title,
            summary,
            content,
            thumbnail,
        })

        return res.status(200).json(postDoc)
    } catch (err) {
        return res.status(400).json({error : err})
    }
}

module.exports = {createPost, getPosts, getPost, updatePost}