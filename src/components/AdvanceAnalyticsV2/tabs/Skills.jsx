import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import Header from '../Header';
import {
  ANALYTICS_TABS, skillsColorMap, skillsTypeColorMap,
} from '../data/constants';
import { useEnterpriseAnalyticsData } from '../data/hooks';
import ChartWrapper from '../charts/ChartWrapper';
import { constructChartHoverTemplate } from '../data/utils';
import DownloadCSVButton from '../DownloadCSVButton';

const Skills = ({ startDate, endDate, enterpriseId }) => {
  const intl = useIntl();

  const {
    isFetching, isError, data,
  } = useEnterpriseAnalyticsData({
    enterpriseCustomerUUID: enterpriseId,
    key: ANALYTICS_TABS.SKILLS,
    startDate,
    endDate,
  });

  return (
    <div className="tab-skills mt-4">
      <div className="top-skill-chart-container mb-4">
        <Header
          title={intl.formatMessage({
            id: 'advance.analytics.skills.tab.chart.top.skills.title',
            defaultMessage: 'Top Skills',
            description: 'Title for the top skills chart.',
          })}
          subtitle={intl.formatMessage({
            id: 'advance.analytics.skills.tab.chart.top.skills.subtitle',
            defaultMessage: 'See the top skills that are the most in demand in your organization, based on enrollments and completions.',
            description: 'Subtitle for the top skills chart.',
          })}
          DownloadCSVComponent={(
            <DownloadCSVButton
              jsonData={data?.topSkills || []}
              csvFileName={`Skills by Enrollment and Completion - ${startDate} - ${endDate}`}
            />
          )}
        />

        <ChartWrapper
          isFetching={isFetching}
          isError={isError}
          chartType="ScatterChart"
          chartProps={{
            data: data?.topSkills,
            xKey: 'enrolls',
            yKey: 'completions',
            colorKey: 'skillType',
            colorMap: skillsTypeColorMap,
            xAxisTitle: intl.formatMessage({
              id: 'advance.analytics.skills.tab.chart.top.skills.x.axis.title',
              defaultMessage: 'Enrollments',
              description: 'X-axis title for the top skills chart.',
            }),
            yAxisTitle: intl.formatMessage({
              id: 'advance.analytics.skills.tab.chart.top.skills.y.axis.title',
              defaultMessage: 'Completions',
              description: 'Y-axis title for the top skills chart.',
            }),
            markerSizeKey: 'completions',
            customDataKeys: ['skillName', 'skillType'],
            hovertemplate: constructChartHoverTemplate(intl, {
              skill: '%{customdata[0]}',
              enrollments: '%{x}',
              completions: '%{y}',
            }),
          }}
          loadingMessage={intl.formatMessage({
            id: 'advance.analytics.skills.tab.chart.top.skills.loading.message',
            defaultMessage: 'Loading top skills chart data',
            description: 'Loading message for the top skills chart.',
          })}
        />
      </div>
      <div className="row">
        <div className="col-md-6">
          <div className="top-skills-by-enrollment-chart-container mb-4">
            <Header
              title={intl.formatMessage({
                id: 'advance.analytics.skills.tab.chart.top.skills.by.enrollment.title',
                defaultMessage: 'Top Skills by Enrollment',
                description: 'Title for the top skills by enrollment chart.',
              })}
            />
            <ChartWrapper
              isFetching={isFetching}
              isError={isError}
              chartType="BarChart"
              chartProps={{
                data: data?.topSkillsByEnrollments,
                xKey: 'skillName',
                yKey: 'count',
                colorKey: 'subjectName',
                colorMap: skillsColorMap,
                yAxisTitle: intl.formatMessage({
                  id: 'advance.analytics.skills.tab.chart.top.skills.by.enrollment.y.axis.title',
                  defaultMessage: 'Number of Enrollments',
                  description: 'Y-axis title for the top skills by enrollment chart.',
                }),
                hovertemplate: constructChartHoverTemplate(intl, {
                  skill: '%{x}',
                  enrollments: '%{y}',
                }),
              }}
              loadingMessage={intl.formatMessage({
                id: 'advance.analytics.skills.tab.chart.top.skills.by.enrollment.loading.message',
                defaultMessage: 'Loading top skills by enrollment chart data',
                description: 'Loading message for the top skills by enrollment chart.',
              })}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="top-skills-by-completion-chart-container mb-4">
            <Header
              title={intl.formatMessage({
                id: 'advance.analytics.skills.tab.chart.top.skills.by.completion.title',
                defaultMessage: 'Top Skills by Completion',
                description: 'Title for the top skills by completion chart.',
              })}
            />
            <ChartWrapper
              isFetching={isFetching}
              isError={isError}
              chartType="BarChart"
              chartProps={{
                data: data?.topSkillsByCompletions,
                xKey: 'skillName',
                yKey: 'count',
                colorKey: 'subjectName',
                colorMap: skillsColorMap,
                yAxisTitle: intl.formatMessage({
                  id: 'advance.analytics.skills.tab.chart.top.skills.by.completion.y.axis.title',
                  defaultMessage: 'Number of Completions',
                  description: 'Y-axis title for the top skills by completion chart.',
                }),
                hovertemplate: constructChartHoverTemplate(intl, {
                  skill: '%{x}',
                  completions: '%{y}',
                }),
              }}
              loadingMessage={intl.formatMessage({
                id: 'advance.analytics.skills.tab.chart.top.skills.by.completion.loading.message',
                defaultMessage: 'Loading top skills by completions chart data',
                description: 'Loading message for the top skills by completions chart.',
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

Skills.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

export default Skills;
