import os


def get_and_write_folder_names():
  cwd = os.getcwd()  # Get the current working directory
  subdirs = [d for d in os.listdir(cwd) if os.path.isdir(os.path.join(cwd, d))]  # Get subdirectories

  # Read existing folder names (if file exists)
  existing_folders = set()
  try:
    with open("folder_names.txt", "r") as f:
      existing_folders.update(f.read().strip().splitlines())
  except FileNotFoundError:
    pass  # Create a new file on first run

  # Identify new or modified folders
  new_or_modified_folders = [subdir for subdir in subdirs if subdir not in existing_folders]

  # Write only new or modified folders to the file
  with open("folder_names.txt", "a") as f:
    for subdir in new_or_modified_folders:
      f.write(subdir + "\n")

  # Inform the user based on the changes
  if len(new_or_modified_folders) == 0:
    print("No new or modified folders found.")
  else:
    print(f"{len(new_or_modified_folders)} new or modified folder names written to 'folder_names.txt'.")


if __name__ == "__main__":
  get_and_write_folder_names()
