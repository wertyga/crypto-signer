import path from 'path';

const env = process.env.NODE_ENV;
const dbName = 'crypto_signer';

export default {
    PORT: env === 'test' ? 3001 : 3000,
    mongoose: {
        uri: env === 'test' ? `mongodb://localhost/${dbName}-test` : `mongodb://localhost/${dbName}`,
        options: {
            server: {
                socketOptions: {
                    keepAlive: 1
                }
            }
        }
    },
    fieldToSaveSession: 'authUserId',
    session: {
        secret: "nodeJSForever",
        key: "sid",
        cookie: {
            secure: false,
            sameSite: true,
            httpOnly: true,
            maxAge: 3600000
        }
    },
    hash: {
        secret: 'boooom!',
        salt: 10
    },
    uploads: {
        directory: 'temp',
        destination: path.join(__dirname, '../', 'temp')
    }
}