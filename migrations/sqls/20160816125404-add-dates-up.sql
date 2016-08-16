
alter table question add column created TIMESTAMP without time zone default (now() at time zone 'utc');
alter table answer add column created TIMESTAMP without time zone default (now() at time zone 'utc');

update question set created=now();
update answer set created=now();