import { connect } from 'react-redux';

import { saveTemplate } from '../../data/actions/emailTemplate';
import SaveTemplateButton from '../../components/SaveTemplateButton';

const mapStateToProps = state => ({
  saving: state.emailTemplate.saving,
  emailTemplateSource: state.emailTemplate.emailTemplateSource,
  emailTemplates: state.emailTemplate,
});

const mapDispatchToProps = dispatch => ({
  saveTemplate: options => new Promise((resolve, reject) => {
    dispatch(saveTemplate({
      options,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveTemplateButton);
