ts-framework
============

A minimalistic framework for typescript based applications.

## Getting Started

### Installing the Alpha Preview

The currently API is considered to be "alpha" so it can change at any time. To 
ensure your project won't crash, refer to the specific commit, instead of a 
SemVer tag or git branch.

For example:

```bash
npm install --save https://gitlab.devnup.com/npm/ts-framework.git#3471f9004798c35c5943cdf9160bd0ce856db62c 
``` 

## Configuring Your Application

Follow the [Configuration Guide](./GUIDE.md) for the basic boilerplate and project creation documentation.


## Documentation

It's in the roadmap an automated documentation based on JSDocs. Currently there are only the JSDocs tags inside of some 
key class and components.


### Server

The HTTP Server definitions.


#### Utility classes

- **SimpleLogger**: A simple Logger factory using [Winston](https://npmjs.org/package/winston).

#### Base classes

- **BaseError**: The base error instance for all framework exceptions.
    - `error.stackId`: An unique uuid/v4 for Errors to be sent to external service, such as ELK or Sentry.
    - `error.details`: An object with misc details associated with the error instance. 

- **BaseRequest**: Extends Express.js request class for framework binding.
    - `request.logger`: The Server logger instance, if supplied in the Server constructor.

- **BaseResponse**: Extends Express.js response class for framework binding.
    - `response.success(data)`: A shortcut for `response.status(200).json(data.toJSON() || data)`.
    - `response.error(error)`: Handles errors before sending to response, cleaning the stack and assigned an unique stackId.

#### Decorators

- **@Controller(baseRoute: string, middlewares: Function[])**: Decorator for controller classes.

- **@Get(route: string, middlewares: Function[])**: Decorator for GET methods, must be static.

- **@Post(route: string, middlewares: Function[])**: Decorator for POST methods, must be static.

- **@Put(route: string, middlewares: Function[])**: Decorator for PUT methods, must be static.

- **@Delete(route: string, middlewares: Function[])**: Decorator for DELETE methods, must be static.


### Database

The MongoDB ODM definitions.

#### Base classes

- **BaseModel**: The base class for all model instances decorated with `@Model`. 
    - `BaseModel.modelName`: The name of the model collection in MongoDB, as supplied in the `@Model` decorator.


#### Decorators

- **@Model(name: string)**: Assigns a name for the decorated model class to be used as collection name in MongoDB. Must
be used in classes that extends `BaseModel`.



## License

The project is licensed under [MIT License](./LICENSE.md).