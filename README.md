# DeepSeek Chat Export

A Firefox extension to export your DeepSeek chat histories as HTML files which you can save locally and share with others.

## Features

- Export chat histories with preserved styling.
- Simple one-click export button.
- This extension was built with help of DeepSeek itself

## Installation

Install from : https://addons.mozilla.org/en-US/firefox/addon/deepseek-chat-export/

## Development Setup

To set up the project for development, you'll need to use Yarn v4 and Corepack.

1.  **Enable Corepack**: If you haven't already, enable Corepack to manage Yarn versions:

    ```bash
    corepack enable
    ```

2.  **Install Dependencies**: Install the project dependencies using Yarn. This will use the Plug'n'Play (PnP) linker.

    ```bash
    yarn install
    yarn build
    ```

3.  **Load the Extension in Firefox**:
    1.  Navigate to `about:debugging#/runtime/this-firefox` in Firefox.
    2.  Click "Load Temporary Add-on...".
    3.  Select the `manifest.json` file from the project's root directory.

## Usage

1. Open DeepSeek's chat interface.
2. Click the "Export Chat" button in the bottom-right corner.
3. Choose the export format (HTML).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
