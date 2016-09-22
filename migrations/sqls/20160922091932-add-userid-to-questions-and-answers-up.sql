ALTER TABLE answer ADD userid INTEGER references users(id) ON DELETE CASCADE;
ALTER TABLE question ADD userid INTEGER references users(id) ON DELETE CASCADE;