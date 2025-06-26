jest.mock('mongoose', () => {
    const mockSchema = jest.fn((definition, options) => {
        return {
            methods: {},
            statics: {},
            pre: jest.fn(),
            post: jest.fn()
        };
    });

    return {
        connect: jest.fn(() => Promise.resolve()),

        connection: {
            readyState: 0,
            on: jest.fn(),
            once: jest.fn(),
            off: jest.fn(),
            close: jest.fn(() => Promise.resolve())
        },

        Schema: mockSchema,

        model: jest.fn((name, schema) => {
            return {
                find: jest.fn().mockReturnThis(),
                findById: jest.fn().mockReturnThis(),
                findOne: jest.fn().mockReturnThis(),
                create: jest.fn(),
                insertMany: jest.fn(),
                findOneAndUpdate: jest.fn().mockReturnThis(),
                updateMany: jest.fn().mockReturnThis(),
                deleteOne: jest.fn().mockReturnThis(),
                deleteMany: jest.fn().mockReturnThis(),
                countDocuments: jest.fn(),
                aggregate: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn()
            };
        })
    };
});
