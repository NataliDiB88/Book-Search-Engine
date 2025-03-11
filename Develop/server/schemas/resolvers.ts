import { AuthenticationError } from 'apollo-server-express';
import { User } from '../models';
import { signToken } from '../utils/auth';


interface Context {
    user?: {
        _id: string;
    };
}

interface UserArgs {
    email: string;
    password: string;
}

interface AddUserArgs {
    username: string;
    email: string;
    password: string;
}

interface SaveBookArgs {
    input: {
        bookId: string;
        authors: string[];
        description: string;
        title: string;
        image: string;
        link: string;
    };
}

interface RemoveBookArgs {
    bookId: string;
}

const resolvers = {
    Query: {
        me: async (_: any, __: any, context: Context) => {
            if (context.user) {
                return await User.findById(context.user._id);
            }
            throw new AuthenticationError('Not logged in');
        },
    },
    Mutation: {
        login: async (_: any, { email, password }: UserArgs) => {
            const user = await User.findOne({ email });
            if (!user) throw new AuthenticationError('User not found');
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) throw new AuthenticationError('Incorrect password');
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (_: any, args: AddUserArgs) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (_: any, { input }: SaveBookArgs, context: Context) => {
            if (context.user) {
                return await User.findByIdAndUpdate(
                    context.user._id,
                    { $addToSet: { savedBooks: input } },
                    { new: true }
                );
            }
            throw new AuthenticationError('Not logged in');
        },
        removeBook: async (_: any, { bookId }: RemoveBookArgs, context: Context) => {
            if (context.user) {
                return await User.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
            }
            throw new AuthenticationError('Not logged in');
        },
    },
};

export { resolvers };

export { resolvers };
