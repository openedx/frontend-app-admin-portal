class NewRelicService {
  static logInfo(message) {
    if (typeof newrelic !== 'undefined') {
      newrelic.addPageAction('INFO', { message });
    }
  }

  static logError(error) {
    if (typeof newrelic !== 'undefined') {
      newrelic.noticeError(error);
    }
  }

  static logAPIErrorResponse(error) {
    let { message } = error;
    if (error.response) {
      message = `${error.response.status} ${error.response.config.url} ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      message = `${error.request.status} ${error.request.responseURL} ${error.request.responseText}`;
    } else if (error.stack) {
      message = error.stack;
    }
    this.logError(new Error(`API request failed: ${message}`));
  }
}

export default NewRelicService;
