import { Alert } from '@edx/paragon';

const ContentHighlightArchivedCoursesAlert = () => {
  return (
    <Alert
      variant="info"
      dismissible
      closeLabel="Dismiss"
      onClose={(e) => console.log('hi')}
    >
      <Alert.Heading>Needs Review: Archived Course(s)</Alert.Heading>
      <p>Course(s) in your highlight(s) have been archived and are no longer open for new enrollments.</p>
    </Alert>
  );
};

export default ContentHighlightArchivedCoursesAlert;