# rikai

[日本語](README.md)

This is a translation. The Japanese [README.md](README.md) is the source of truth.

## What is this?

rikai (理解, "understanding") is a mode (a Claude skill) that checks your understanding after every AI answer and helps you deepen it.

- Start and stop: Start it with `/rikai` or "start rikai". Turn it off with `/rikai off` or "stop rikai".
- Output for each answer: answer body → judgement (when you replied to the previous question, or asked for details) → understanding report → one question, in that order.
- Question: One question, either a "question suggestion" or a "quiz".
  - Question suggestion: Suggests a question to ask next (such as "What is X?"), or prompts you to restate it in your own words as "So X means Y?".
  - Quiz: Terms and facts are multiple choice (you also give your reason). Mechanisms and reasons are free-form.
  - In Claude Code, a script randomly decides which one to ask. In other environments, it starts with a question suggestion and then alternates.
- Judgement: Your reply is sorted into four categories, "Understood / Partly understood / Not yet understood / No reply", based on whether it matches the AI's interpretation. It does not guarantee that the AI's answer is correct.
  - Points you asked about in detail, such as "What is X?", are recorded as points you do not understand yet. The report is for finding where your understanding falls short. It is not a score.
- Understanding report: Records points under the four categories above, for each topic. By default it is shown in the chat. You can also choose to save it to a file. While file saving is on, the report is not shown in the chat.
- Environment: Use it as a plugin in Claude Code, or register it as a ZIP on claude.ai and similar. The script and file saving are extra features used only in Claude Code.
- Language: The output follows the language you write in. If you talk to it in English, the questions and reports are in English too.
- Good for:
  - When you have AI write code or documents, and want to understand them before moving on
  - When you want to ask AI about a concept from a book that you did not understand, or check whether your understanding is right

## Background and problem

Generative AI has become an everyday tool. You can now create code and documents without understanding what is inside. Just reading the code and documents AI wrote, or listening to its explanations, does not tell you whether you really understand them. The same is true when someone explains something to you, or when you read a book. You move on while only thinking you understand.

For AI agents, one cause is that they are faithful to carrying out the tasks they are asked to do. Even if the user does not understand, AI does not stop. It tries to move on to the next task.

## Approach of this skill

This skill focuses on that property: AI agents are faithful to carrying out the tasks they are asked to do. If you give the AI a procedure for checking understanding in advance, it follows that procedure faithfully too, and checks your understanding with every answer.

After each AI answer, it repeats the following flow.

1. Ask one question (a question suggestion or a quiz)
2. From your reply, judge which points you understand and which you do not
3. Update the understanding report

## Example

You ask AI to change the color of the submit button. The AI rewrites `--color-primary`, a shared variable that decides button colors. This variable is also used by other buttons and links.

### Without rikai

> **User**: Make the submit button blue.
>
> **AI**: I changed `--color-primary` to blue. Shall I merge next?
>
> **User**: Please.

The change gets merged before you notice that other buttons and links change color too.

### With rikai

This scene is in Claude Code, after rikai has been started. For explanation, the understanding report attached to the first answer is omitted, and some parts are tidied up.

> **User**: Make the submit button blue.
>
> **AI**: I changed `--color-primary` to blue.
>
> **Question**: Where does the color change with this edit? Give your reason too.
> A. Only the submit button
> B. Everywhere that uses `--color-primary`
> C. All buttons
>
> **User**: A. Because I asked to make the submit button blue.
>
> **AI**: Judgement: Not yet understood
> The answer is B. What was changed is not a color just for the submit button, but a shared variable. Other buttons and links that use the same variable change color too.

Before merging, you can see the gap between what you expected and what actually changed. The result is kept in the report.

```markdown
# Understanding Report: Changing the submit button color
Answer number: 1
Summary: Understanding the impact of changing the submit button color

## Understood
- None

## Partly understood
- None

## Not yet understood
- Changing `--color-primary` changes the color everywhere that uses the same variable

## Explained by AI, no reply from user yet
- None
```

### The next question

After the report, exactly one next question follows. It is either a quiz or a question suggestion. In this scene, it could look like this.

**Quiz**: You answer a question that checks your understanding. Besides multiple choice like the example above, there are also free-form questions.

> Why do colors other than the submit button change when you change `--color-primary`?

**Question suggestion**: The AI suggests a question you should ask it next.

> Try asking, "Where is `--color-primary` used?"

It may also prompt you to restate it in your own words. The AI does not fill in the answer. You think and restate it yourself.

> Try filling in Y with your own words, in the form "So changing `--color-primary` means Y?"

## Installation

### Claude Code

In Claude Code, install it as a plugin. Run the following commands in order in the Claude Code input box.

```text
/plugin marketplace add kokuto821/rikai
/plugin install rikai@rikai
```

### Registering from a ZIP file (claude.ai and similar)

Use the dedicated ZIP for Claude's skill registration feature. A ZIP of the whole repository from GitHub's "Download ZIP" also contains the plugin settings and development files, so it may fail to register. The dedicated ZIP contains only `SKILL.md`, the skill itself.

Download the dedicated ZIP file from the link below.

- [rikai.zip (download the latest version)](https://github.com/kokuto821/rikai/releases/latest/download/rikai.zip)

Upload the downloaded `rikai.zip` to Claude's skill registration screen as is, without unzipping it.

## Using it with other skills

When used with similar skills (such as skills that check understanding) or skills that change writing style, their instructions may conflict. For example, the judgement, understanding report, and question may be compressed into the style of the other skill. If the output gets garbled, turn off the other skill while using rikai.

## Input box suggestions

Claude Code may show a prediction of your next message in faint text in the input box (prompt suggestions). Right after a quiz, it may show the answer. Suggestions are a feature of Claude Code itself, and the skill cannot suppress them. If seeing the answer is a problem, turn them off in your settings.

- Turn off Prompt suggestions in `/config`
- Or write `"promptSuggestionEnabled": false` in `settings.json`
- Or set the environment variable `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false` (it takes priority over both `/config` and `settings.json`)

## License

[MIT License](LICENSE)
