import 'whatwg-fetch';

class CoursesApi {
  static getCourseBlocks(courseRunId) {
    return fetch(outlineUrl, {
      credentials: 'include',
      headers: {
        // TODO: get cookie from cookies.get('csrftoken'), which will assume login on
        // LMS already and same-origin
        'X-CSRFToken': 'axjfX6SquerIjJ9PogaRTOvYElCSWcW2ADxW0MSVhC8PpfysXJzFV3gmQuUsfcVd',
      },
    })
    // TODO: handle response error
    .then(response => response.json())
    .then(data => buildOutlineTree(data))
    .then((outline) => {
        dispatch(getOutline(outline));
        dispatch(finishedFetchingOutline());
    });
  }
}

export default CourseApi;
