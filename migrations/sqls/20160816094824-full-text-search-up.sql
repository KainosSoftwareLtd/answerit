
alter table question add column ti tsvector;
alter table answer add column ti tsvector;

update answer set ti=to_tsvector('english', text);
update question set ti=to_tsvector('english', text);