import { connect } from 'react-redux';

import TemplateSourceFields from '../../components/TemplateSourceFields';

import fetchEmailTemplates, { setEmailTemplateSource, currentFromTemplate } from '../../data/actions/emailTemplate';

const mapStateToProps = state => ({
  emailTemplateSource: state.emailTemplate.emailTemplateSource,
  allEmailTemplates: state.emailTemplate.allTemplates,
});

const mapDispatchToProps = dispatch => ({
  setEmailTemplateSource: templateSource => dispatch(setEmailTemplateSource(templateSource)),
  currentFromTemplate: (type, template) => dispatch(currentFromTemplate(type, template)),
  fetchEmailTemplates: (options) => {
    dispatch(fetchEmailTemplates(options));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TemplateSourceFields);
