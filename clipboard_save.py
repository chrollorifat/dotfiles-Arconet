import pyperclip
import argparse

def save_clipboard_to_file(n_entries, filename="clipboard_data.txt", mode="a"):
    """
    Saves the latest n entries from the clipboard to a file.

    Args:
        n_entries (int): Number of entries to save.
        filename (str, optional): Name of the file to save to. defaults to "clipboard_data.txt".
        mode (str, optional): File open mode. defaults to "a" for appending.
    """

    clipboard_history = pyperclip.paste().splitlines()[:n_entries]

    with open(filename, mode) as f:
        for entry in clipboard_history:
            f.write(entry + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Save clipboard entries to a file")  # Corrected line
    parser.add_argument("number", type=int, help="Number of entries to save")
    args = parser.parse_args()

    save_clipboard_to_file(args.number)
