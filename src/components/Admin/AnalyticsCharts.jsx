import React from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';


class AnalyticsCharts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // To avoid unnecessary update keep all options in the state.
      weekWiseEnrollment: {
        chartOptions: {
          title: {
            text: 'Enrollment',
          },
          yAxis: {
            title: {
              text: 'Enrollments',
            },
          },
          xAxis: {
            type: 'datetime',
          },
          series: [{
            name: 'Period',
            data: [
              [Date.UTC(2020, 0, 1), 29.9],
              [Date.UTC(2020, 0, 2), 71.5],
              [Date.UTC(2020, 0, 3), 106.4],
              [Date.UTC(2020, 0, 6), 129.2],
              [Date.UTC(2020, 0, 7), 144.0],
              [Date.UTC(2020, 0, 8), 176.0],
            ],
          }],
          responsive: {
            rules: [{
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  layout: 'horizontal',
                  align: 'center',
                  verticalAlign: 'bottom',
                },
              },
            }],
          },
        },
      },
      gradeDistribution: {
        chartOptions: {
          title: {
            text: 'Grade Distribution',
          },
          chart: {
            type: 'column',
          },
          xAxis: {
            categories: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ],
            crosshair: true,
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Grades',
            },
          },
          tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true,
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
            },
          },
          series: [{
            name: 'Pass',
            data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
          }, {
            name: 'Fail',
            data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3],
          }],
        },
      },
      inProgress: {
        chartOptions: {
          title: {
            text: 'Progress',
          },
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
          },
          accessibility: {
            point: {
              valueSuffix: '%',
            },
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              },
            },
          },
          series: [{
            name: 'Brands',
            colorByPoint: true,
            data: [{
              name: 'In Progress',
              y: 61.41,
              sliced: true,
              selected: true,
            }, {
              name: 'Completed',
              y: 11.84,
            }],
          }],
        },
      },
    };
  }

  setHoverData = (e) => {
  // The chart is not updated because `chartOptions` has not changed.
  }

  updateWeekWiseEnrollment = () => {
    // The chart is updated only with new options.
    this.setState({
      weekWiseEnrollment: {
        chartOptions: {
          series: [
            {
              data: [
                [Date.UTC(2020, 0, 1), Math.random() * 50],
                [Date.UTC(2020, 0, 2), Math.random() * 50],
                [Date.UTC(2020, 0, 3), Math.random() * 50],
                [Date.UTC(2020, 0, 6), Math.random() * 50],
                [Date.UTC(2020, 0, 7), Math.random() * 50],
                [Date.UTC(2020, 0, 8), Math.random() * 50],
              ],
            },
          ],
        },
      },
    });
  }

  updateGradeDistribution = () => {
    // The chart is updated only with new options.
    const DATA_LENGTH = 12;
    this.setState({
      gradeDistribution: {
        chartOptions: {
          series: [{
            name: 'Pass',
            data: Array.from(Array(DATA_LENGTH)).map(x => Math.random() * 50),
          }, {
            name: 'Fail',
            data: Array.from(Array(DATA_LENGTH)).map(x => Math.random() * 50),
          }],
        },
      },
    });
  }

  updateInProgress = () => {
    // The chart is updated only with new options.
    this.setState({
      inProgress: {
        chartOptions: {
          series: [{
            data: [{
              name: 'In Progress',
              y: Math.random() * 50,
              sliced: true,
              selected: true,
            }, {
              name: 'Completed',
              y: Math.random() * 50,
            }],
          }],
        },
      },
    });
  }

  render() {
    const { weekWiseEnrollment, gradeDistribution, inProgress } = this.state;
    return (
      <React.Fragment>
        <div
          className="col-xs-12 col-md-6 col-xl-3 mb-3"
          key="weekWiseEnrollment"
        >
          <HighchartsReact
            highcharts={Highcharts}
            options={weekWiseEnrollment.chartOptions}
          />
          <button onClick={this.updateWeekWiseEnrollment.bind(this)}>Update</button>
        </div>
        <div
          className="col-xs-12 col-md-6 col-xl-3 mb-3"
          key="gradeDistribution"
        >
          <HighchartsReact
            highcharts={Highcharts}
            options={gradeDistribution.chartOptions}
          />
          <button onClick={this.updateGradeDistribution.bind(this)}>Update</button>
        </div>
        <div
          className="col-xs-12 col-md-6 col-xl-3 mb-3"
          key="inProgress"
        >
          <HighchartsReact
            highcharts={Highcharts}
            options={inProgress.chartOptions}
          />
          <button onClick={this.updateInProgress.bind(this)}>Update</button>
        </div>
      </React.Fragment>
    );
  }
}

export default AnalyticsCharts;
