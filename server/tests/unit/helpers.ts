export function buildValidLtiRequestForm() {
  const formData = new FormData();

  [
    { name: 'oauth_version', value: '1.0' },
    { name: 'oauth_nonce', value: '9fdbdffaf5afbce2b4771affad120fc3' },
    { name: 'oauth_timestamp', value: '1695492752' },
    { name: 'oauth_consumer_key', value: 'key' },
    { name: 'user_id', value: '3' },
    { name: 'lis_person_sourcedid', value: '' },
    { name: 'roles', value: 'Learner' },
    { name: 'context_id', value: '2' },
    { name: 'context_label', value: 'asd' },
    { name: 'context_title', value: 'asd' },
    { name: 'lti_message_type', value: 'basic-lti-launch-request' },
    { name: 'resource_link_title', value: 'serverless-lti' },
    { name: 'resource_link_description', value: '' },
    { name: 'resource_link_id', value: '6' },
    { name: 'context_type', value: 'CourseSection' },
    { name: 'lis_course_section_sourcedid', value: '' },
    {
      name: 'lis_result_sourcedid',
      value:
        '{"data":{"instanceid":"6","userid":"3","typeid":"6","launchid":999785741},"hash":"682f59fbdc715c813dc86dc86e94bd5491ab396c4807d23bfd6d4d8e20a8ac58"}',
    },
    {
      name: 'lis_outcome_service_url',
      value: 'http://localhost/mod/lti/service.php',
    },
    { name: 'lis_person_name_given', value: 'János' },
    { name: 'lis_person_name_family', value: 'Kulka' },
    { name: 'lis_person_name_full', value: 'János Kulka' },
    { name: 'ext_user_username', value: 'student' },
    { name: 'lis_person_contact_email_primary', value: 'sad@sad.com' },
    { name: 'launch_presentation_locale', value: 'en' },
    { name: 'ext_lms', value: 'moodle-2' },
    { name: 'tool_consumer_info_product_family_code', value: 'moodle' },
    { name: 'tool_consumer_info_version', value: '2022112800.07' },
    { name: 'oauth_callback', value: 'about:blank' },
    { name: 'lti_version', value: 'LTI-1p0' },
    {
      name: 'tool_consumer_instance_guid',
      value: '23f9372bd998340f13cb494b1ddb6757',
    },
    { name: 'tool_consumer_instance_name', value: 'moodle' },
    {
      name: 'tool_consumer_instance_description',
      value: 'expic next-gen e-learning platform',
    },
    { name: 'launch_presentation_document_target', value: 'iframe' },
    {
      name: 'launch_presentation_return_url',
      value:
        'http://localhost/mod/lti/return.php?course=2&launch_container=3&instanceid=6&sesskey=pN3KCFASBW',
    },
    { name: 'oauth_signature_method', value: 'HMAC-SHA1' },
    { name: 'oauth_signature', value: 'TqpAprcZSWLIUUvYGm+tSp/1exg=' },
  ].forEach(({ name, value }) => {
    formData.set(name, value);
  });

  return formData;
}
