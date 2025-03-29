SELECT instructor.id, instructor.name, count(*) as "assigned topics" FROM instructor
JOIN topic on topic.instructor_id = instructor.id
JOIN student on student.assigned_topic_id = topic.id
GROUP BY instructor.id, instructor.name
;
