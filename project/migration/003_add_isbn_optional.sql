-- Optional exercise: apply only after migrations 001 and 002.
ALTER TABLE books
ADD COLUMN isbn TEXT;
