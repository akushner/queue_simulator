# How to Run the Python Backend

This guide provides the steps to set up the virtual environment and run the server.

**Important:** These commands should be run from the **root of the repository**, not from within the `python/` directory.

## 1. Create and Activate the Virtual Environment

If you haven't already, create and activate the virtual environment.

*   **Create (run once from the root directory):**
    ```sh
    python3 -m venv python/venv
    ```

*   **Activate (run from the root directory):**
    *   On macOS and Linux:
        ```sh
        source python/venv/bin/activate
        ```
    *   On Windows:
        ```sh
        python\venv\Scripts\activate
        ```

After running this command, your command prompt should be prefixed with `(venv)`.

## 2. Install Dependencies

If you haven't already, install the required libraries.

```sh
pip install -r python/requirements.txt
```

## 3. Run the Server

Once the virtual environment is active, run the application with the following command from the **root of the repository**:

```sh
uvicorn python.main:app --reload
```

The server will be running at `http://127.0.0.1:8000`.

## 4. Deactivate the Virtual Environment

When you are finished, you can exit the virtual environment with the following command:

```sh
deactivate
```