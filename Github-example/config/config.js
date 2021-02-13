module.exports = {
    server_port:3000,
    db_url:'mongodb://localhost:27017/github',
    db_schemas: [
        {file:'./user_schema', collection:'users3', schemaName:'UserSchema', modelName:'UserModel'}
    ],
    route_info: []
};