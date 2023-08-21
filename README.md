SmarmelBot
==========

SmarmelBot is a personal project built using NestJS, aimed at learning to work with Telegram bots and functional programming patterns. This project serves as a testing ground to experiment with creating a Telegram bot that manages chats with different friends. The bot performs various tasks and interactions based on functional programming principles.

Table of Contents
-----------------

-   [Description](https://chat.openai.com/#description)
-   [Installation](https://chat.openai.com/#installation)
-   [Usage](https://chat.openai.com/#usage)
-   [Functionalities](https://chat.openai.com/#functionalities)
-   [Dependencies](https://chat.openai.com/#dependencies)
-   [Development](https://chat.openai.com/#development)
-   [Testing](https://chat.openai.com/#testing)
-   [Contributing](https://chat.openai.com/#contributing)
-   [License](https://chat.openai.com/#license)

Description
-----------

SmarmelBot is a NestJS application designed to run a Telegram bot that engages in conversations with multiple friends. The primary goal of this project is to learn how to create and manage Telegram bots while implementing functional programming concepts. The bot uses the [NestJS Telegraf](https://github.com/AntonioFalcao/nestjs-telegraf) library for interacting with the Telegram Bot API.

Installation
------------

1.  Clone this repository to your local machine.

2.  Navigate to the project directory.

3.  Install the required dependencies using the following command:

    bashCopy code

    `npm install`

Usage
-----

To use SmarmelBot, follow these steps:

1.  Configure your Telegram bot token by creating a `.env` file in the root directory and adding the following line:

    makefileCopy code

    `TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE`

2.  Customize and extend the bot's functionalities by editing the source code located in the `src` directory.

3.  Run the bot using the following command:

    bashCopy code

    `npm run start`

Functionalities
---------------

SmarmelBot demonstrates various functionalities, including but not limited to:

-   Managing conversations with friends.
-   Responding to messages using functional programming patterns.
-   Performing tasks based on specific commands.
-   Scheduling and sending messages at specific times.
-   Interacting with external APIs to retrieve data.
-   Converting YouTube videos to MP3 files.

Dependencies
------------

SmarmelBot relies on the following dependencies (among others) to provide its functionality:

-   `nestjs/telegraf`: A NestJS module for creating Telegram bots using the Telegraf library.
-   `nestjs/schedule`: A NestJS module for scheduling tasks.
-   `fluent-ffmpeg`: A library for handling multimedia data.
-   `telegraf`: A popular Telegram Bot API library.
-   `ioredis`: A Redis client for Node.js, used for caching and data storage.

For a complete list of dependencies, refer to the `package.json` file.

Development
-----------

For development purposes, you can use the available scripts:

-   `npm run start:dev`: Start the application in development mode with automatic restart on file changes.
-   `npm run start:debug`: Start the application in debug mode with automatic restart and debugging capabilities.

Testing
-------

You can run tests using the following scripts:

-   `npm test`: Run all unit tests.
-   `npm run test:watch`: Run tests in watch mode.
-   `npm run test:cov`: Run tests and generate coverage reports.

Contributing
------------

Contributions to SmarmelBot are welcome! Feel free to open issues for feature requests, bug fixes, or general suggestions.

Before submitting a pull request, ensure that your code follows the project's coding standards and has appropriate test coverage.

License
-------

This project is licensed under the UNLICENSED license. Feel free to use, modify, and distribute it as per your needs.
