<div align="center">
<h1>
   <img src="https://img.icons8.com/pulsar-color/96/markdown.png" width="100" height="100" />
   <br>
   NEWS-FACTS-EXPLANATION-WEBSITE
</h1>
<h3>◦ News made simple. Facts explained.</h3>
<h3>◦ Developed with the software and tools below.</h3>

<p align="center">
<img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=flat&logo=HTML5&logoColor=white" alt="HTML5">
<img src="https://img.shields.io/badge/Gunicorn-499848.svg?style=flat&logo=Gunicorn&logoColor=white" alt="Gunicorn">
<img src="https://img.shields.io/badge/OpenAI-412991.svg?style=flat&logo=OpenAI&logoColor=white" alt="OpenAI">
<img src="https://img.shields.io/badge/Python-3776AB.svg?style=flat&logo=Python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/GitHub-181717.svg?style=flat&logo=GitHub&logoColor=white" alt="GitHub">
<img src="https://img.shields.io/badge/Flask-000000.svg?style=flat&logo=Flask&logoColor=white" alt="Flask">
<img src="https://img.shields.io/badge/Markdown-000000.svg?style=flat&logo=Markdown&logoColor=white" alt="Markdown">
</p>

![license](https://img.shields.io/github/license/kennysuper007/News-Facts-Explanation-Website?style=flat&labelColor=E5E4E2&color=869BB3)
![repo-language-count](https://img.shields.io/github/languages/count/kennysuper007/News-Facts-Explanation-Website?style=flat&labelColor=E5E4E2&color=869BB3)
![repo-top-language](https://img.shields.io/github/languages/top/kennysuper007/News-Facts-Explanation-Website?style=flat&labelColor=E5E4E2&color=869BB3)
![last-commit](https://img.shields.io/github/last-commit/kennysuper007/News-Facts-Explanation-Website?style=flat&labelColor=E5E4E2&color=869BB3)
</div>

---

## 🔗 Quick Links
- [🔗 Quick Links](#-quick-links)
- [📍 Overview](#-overview)
- [📂 Repository Structure](#-repository-structure)
- [🧩 Modules](#-modules)
- [🚀 Getting Started](#-getting-started)
  - [⚙️ Installation](#️-installation)
  - [🤖 Running News-Facts-Explanation-Website](#-running-news-facts-explanation-website)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 📍 Overview

The News-Facts-Explanation Website is a web application that offers users a platform to access news sentences along with detailed explanations. Users have the option to score these explanations or ask questions about them. A Large Language Model (LLM), like GPT-4, refines the explanations based on user feedback. This website aims to collect human feedback data to survey whether LLMs can generate better explanations when collaborating with humans.

---

## 📂 Repository Structure

```sh
└── News-Facts-Explanation-Website/
    ├── Procfile
    ├── app.py
    ├── chatgpt.py
    ├── download.py
    ├── generatePasscode.py
    ├── prompt.py
    ├── requirements.txt
    └── templates/
        ├── index.html
        ├── signin.html
        └── signup.html

```

---

## 🧩 Modules

<details closed><summary>.</summary>

| File                                                                                                                 | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---                                                                                                                  | ---                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| [requirements.txt](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/requirements.txt)       | This code snippet, located in the parent repository's `app.py` file, is the main entry point for the News-Facts-Explanation-Website. It utilizes dependencies such as Flask, Gunicorn, and ChatGPT to handle routes, user authentication, database queries, and generating AI-powered responses. The file structure is organized with templates for different web pages and other supporting scripts.                                                                                                                                                                         |
| [download.py](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/download.py)                 | This code snippet connects to a MongoDB database, performs a query, and sorts the results. It then saves the query results as a JSON file. The code relies on environment variables for authentication.                                                                                                                                                                                                                                                                                                                                                                       |
| [chatgpt.py](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/chatgpt.py)                   | The `get_response` function in the `chatgpt.py` file handles the logic for generating responses from the GPT-4 model based on user input. It connects to a MongoDB database to store chat logs and manages user authentication. The function takes in an incoming message, checks user authentication, and generates a response using the GPT-4 model. It then saves the assistant's response in the session data and returns it. If the user is an admin or if the session data exceeds a certain limit, the chat logs are saved in the database and the user is logged out. |
| [app.py](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/app.py)                           | This code snippet is part of a repository for a News Facts Explanation Website. The main role of this code is to handle user authentication and session management. It utilizes Flask, PyMongo, and other dependencies to provide login, signup, and session management functionalities.                                                                                                                                                                                                                                                                                      |
| [prompt.py](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/prompt.py)                     | This code snippet contains functions for generating explanations and summaries based on a conversation history. It uses the OpenAI GPT-4 model and connects to a MongoDB database. The functions handle user prompts, message responses, and rating criteria. The code supports a fake news debunking website.                                                                                                                                                                                                                                                                |
| [Procfile](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/Procfile)                       | The code snippet is a web application built using Python and Gunicorn. It serves as the entry point for the application and handles HTTP requests. It is part of a repository that follows a specific directory structure and has dependencies listed in the Procfile.                                                                                                                                                                                                                                                                                                        |
| [generatePasscode.py](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/generatePasscode.py) | This code snippet generates a JSON file containing 300 random alphanumeric passcodes with unique IDs. The passcodes are marked as unused. The generated file is used as a dependency in the codebase.                                                                                                                                                                                                                                                                                                                                                                         |

</details>

<details closed><summary>templates</summary>

| File                                                                                                           | Summary                                                                                                                                                                                                                                                                                     |
| ---                                                                                                            | ---                                                                                                                                                                                                                                                                                         |
| [index.html](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/templates/index.html)   | This code snippet represents the index.html file in the News-Facts-Explanation-Website repository. It is responsible for defining the structure and layout of the website's homepage, including interactive elements like chat and feedback functionality.                                  |
| [signin.html](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/templates/signin.html) | The code snippet is a HTML template for a login page in a News-Facts-Explanation-Website repository. It provides a form for users to enter their user ID and password and has options for signing up or signing in.                                                                         |
| [signup.html](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/templates/signup.html) | The code snippet is a signup form for a News-Facts-Explanation-Website. It allows users to enter their user ID and password to sign up for an account. The form includes validation and submit buttons. It is part of the website's templates directory structure and uses CSS for styling. |

</details>

---

## 🚀 Getting Started
### ⚙️ Installation

1. Clone the News-Facts-Explanation-Website repository:
```sh
git clone https://github.com/kennysuper007/News-Facts-Explanation-Website
```

2. Change to the project directory:
```sh
cd News-Facts-Explanation-Website
```

3. Install the dependencies:
```sh
pip install -r requirements.txt
```

### 🤖 Running News-Facts-Explanation-Website
Use the following command to run News-Facts-Explanation-Website:
```sh
flask app.py
```

---

## 🤝 Contributing

Contributions are welcome! Here are several ways you can contribute:

- **[Submit Pull Requests](https://github.com/kennysuper007/News-Facts-Explanation-Website/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **[Join the Discussions](https://github.com/kennysuper007/News-Facts-Explanation-Website/discussions)**: Share your insights, provide feedback, or ask questions.
- **[Report Issues](https://github.com/kennysuper007/News-Facts-Explanation-Website/issues)**: Submit bugs found or log feature requests for News-Facts-Explanation-Website.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your GitHub account.
2. **Clone Locally**: Clone the forked repository to your local machine using a Git client.
   ```sh
   git clone <your-forked-repo-url>
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear and concise message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to GitHub**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.

Once your PR is reviewed and approved, it will be merged into the main branch.

</details>

---

## 📄 License


This project is protected under the MIT License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---
