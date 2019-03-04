import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const url = "https://ci.eclipse.org/openj9";
const buildName = "Pipeline-Build-Test-All";
const groups = ["functional", "system", "openjdk"];

// export class SummarySetting extends Component {
//     onChange = obj => {
//         this.props.onChange( { buildSelected: obj.target.value } );
//     }

//     render() {
//         const { buildSelected } = this.props;

//         return <div/>;
//     }
// }

export default class Summary extends Component {
    static Title = 'Summary';
    static defaultSize = { w: 4, h: 4 }
    // static Setting = SummarySetting;
    // static defaultSettings = {
    //     buildSelected: Object.keys( map )[0]
    // }

    state = {
        displaySeries: [],
    };

    async componentDidMount() {
        await this.updateData();
    }

    async updateData() {

        const params = `url=${url}&buildName=${buildName}`;
        const fetchBuild = await fetch(`/api/getBuildHistory?${params}&limit=6`, {
            method: 'get'
        });
        let builds = await fetchBuild.json();
        builds = builds.reverse();
        console.log("builds", builds);
        if (builds.length) {
            const allBuilds = await Promise.all(builds.map(async build => {

                return {
                    [`${buildName} ${build.buildNum}`]: await Promise.all(groups.map(async group => {
                        const fetchBuild = await fetch(`/api/getTotals?${params}&buildNum=${build.buildNum}&group=${group}`, {
                            method: 'get'
                        });
                        return { [group]: await fetchBuild.json() }
                    }))
                };

            }));
            console.log("allBuilds", allBuilds);

            this.setState({
                builds: allBuilds
            });
        }


    }

    render() {
        const { builds } = this.state;
        if (!builds) return null;

        let data = {};
        groups.map(group => {
            data[group] = {
                passed: [],
                failed: [],
                skipped: [],
                total: [],
            };
            builds.map((build, i) => {
                const key = Object.keys(build)[0];
                const values = build[key];
                values.map(value => {
                    const fn = name => {
                        if (value[group]) {
                            data[group][name][i] = (data[group][name][i] || 0) + (value[group][name] || 0);
                        }
                    };
                    fn("passed");
                    fn("failed");
                    fn("skipped");
                    fn("total");
                });

            });
        });
        console.log("data", data);

        const names = ["passed", "failed", "skipped"];
        const series = groups.map(group => {
            return names.map(name => {

                return {
                    name: `${group} - ${name}`,
                    data: data[group][name],
                    stack: group,
                };
            });
        }).flat();

        let totals = [];
        groups.map(group => {
            data[group].total.map((totalVal, i) => {
                if (!totals[i]) totals[i] = 0;
                totals[i] = totals[i] + totalVal;
            });
        });

        console.log("series", series);
        series.push({
            type: 'spline',
            name: 'Total tests',
            data: totals,
            marker: {
                lineWidth: 2,
                lineColor: Highcharts.getOptions().colors[3],
                fillColor: 'white'
            }
        });

        const options = {
            chart: {
                type: 'column'
            },

            title: {
                text: 'Total tests consumption'
            },

            xAxis: {
                categories: builds.map(build => Object.keys(build)[0])
            },

            yAxis: {
                allowDecimals: false,
                min: 0,
                title: {
                    text: 'Number of tests'
                }
            },

            tooltip: {
                formatter: function () {
                    if (this.point.stackTotal) {
                        return '<b>' + this.x + '</b><br/>' +
                            this.series.name + ': ' + this.y + '<br/>' +
                            'Total: ' + this.point.stackTotal;
                    } else {
                        return '<b>' + this.x + '</b><br/>' +
                            this.series.name + ': ' + this.y + '<br/>';
                    }

                }
            },

            plotOptions: {
                column: {
                    stacking: 'normal'
                },
                series: {
                    minPointLength: 3, // Make the small values show up
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                window.location.href = 'https://google.ca';
                            }
                        }
                    }
                },

            },

            series
        }

        return <div>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </div>;
    }
}