const express = require('express');
const expressGraphQL = require('express-graphql');
const app = express();
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull
} = require('graphql');

/**
 * Dummy data
 */
const posts = require('./data/posts');
const comments = require('./data/comments');
const users = require('./data/users');

/**
 * GraphQL root query
 */
const RootQueryType = new GraphQLObjectType({
	name: 'Query',
	description: 'Root Query - top level query',
	fields: () => ({
		post: {
			type: PostType,
			description: 'A single blog post',
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => posts.find(book => book.id === args.id)
		},
		posts: {
			type: new GraphQLList(PostType),
			description: 'List of blog posts',
			resolve: () => posts
		},
		comments: {
			type: new GraphQLList(PostCommentType),
			description: 'List of blog post comments',
			resolve: () => comments
		}
	})
});

/**
 * GraphQL types
 */
const PostType = new GraphQLObjectType({
	name: 'Post',
	description: 'This represents a blog post',
	fields: () => ({
		userId: {
			type: GraphQLNonNull(GraphQLInt)
		},
		id: {
			type: GraphQLNonNull(GraphQLInt)
		},
		title: {
			type: GraphQLNonNull(GraphQLString)
		},
		body: {
			type: GraphQLNonNull(GraphQLString)
		},
		comments: {
			type: new GraphQLList(PostCommentType),
			resolve: (post) => {
				return comments.filter(comment => {
					return comment.postId === post.id;
				});
			}
		}
	})
});

const PostCommentType = new GraphQLObjectType({
	name: 'PostComment',
	description: 'This represents a blog post comment',
	fields: () => ({
		postId: {
			type: GraphQLNonNull(GraphQLInt)
		},
		post: {
			type: PostType, // Relation to another type
			resolve: (comment) => {
				posts.find(post => {
					return post.id === comment.postId;
				})
			}
		},
		id: {
			type: GraphQLNonNull(GraphQLInt)
		},
		name: {
			type: GraphQLNonNull(GraphQLString)
		},
		email: {
			type: GraphQLNonNull(GraphQLString)
		},
		body: {
			type: GraphQLNonNull(GraphQLString)
		},
	})
});

/**
 * GraphQL schema
 */
const schema = new GraphQLSchema({
	query: RootQueryType
});


/**
 * API routes
 */
app.use('/graphql', expressGraphQL({
	schema,
	graphiql: true
}));

/**
 * Server
 */
app.listen(5000, () => { console.log('Server running') });