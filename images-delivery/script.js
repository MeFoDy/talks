var chartStyle = {
    title: {
        fontSize: '24px',
    },
    pie: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    column: {
        type: 'column'
    },
    labelStyle: {
        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
        fontSize: '14px',
        fontWeight: '400',
    },
}

var contentTypeChart = Highcharts.chart('chart-content-type', {
    chart: chartStyle.pie,
    title: {
        text: 'Average Bytes per Page by Content Type, June 1 2018',
        style: chartStyle.title,
    },
    tooltip: {
        pointFormat: '<b>{point.y} kB</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}:</b> {point.y} kB ({point.percentage:.1f}%)',
                style: chartStyle.labelStyle
            }
        }
    },
    series: [{
        colorByPoint: true,
        data: [
            {
                name: "Изображения",
                y: 1877,
                sliced: true,
                selected: true
            },
            { name: "Другое", y: 23 },
            { name: "HTML", y: 69 },
            { name: "CSS", y: 92 },
            { name: "Шрифты", y: 117 },
            { name: "JavaScript", y: 482 },
            { name: "Видео", y: 838 },
        ]
    }]
});

var imageRequestsChart = Highcharts.chart('chart-image-requests', {
    chart: chartStyle.pie,
    title: {
        text: 'Image Requests by Format, June 1 2018',
        style: chartStyle.title,
    },
    tooltip: {
        pointFormat: '<b>{point.y}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}:</b> {point.y}%',
                style: chartStyle.labelStyle
            }
        }
    },
    series: [{
        colorByPoint: true,
        data: [
            {
                name: "JPG", y: 45,
                sliced: true,
                selected: true
            },
            { name: "Другое", y: 2 },
            { name: "WebP", y: 1 },
            { name: "SVG", y: 2 },
            { name: "GIF", y: 22 },
            { name: "PNG", y: 28 },
        ]
    }]
});

var imagePerPageChart = Highcharts.chart('chart-images-per-page', {
    chart: chartStyle.column,
    title: {
        text: 'Image Requests per Page, June 1 2018',
        style: chartStyle.title,
    },
    xAxis: {
        categories: [
            '1-20',
            '21-40',
            '41-60',
            '61-80',
            '81-100',
            '101-120',
            '121-140',
            '141-160',
        ],
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Частота (%)'
        }
    },
    tooltip: {
        pointFormat: '<b>{point.y}%</b>'
    },
    plotOptions: {
        column: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '{point.y}%',
                style: chartStyle.labelStyle
            }
        }
    },
    series: [{
        name: 'Количество запросов',
        data: [27, 25, 18, 11, 6, 4, 3, 1],
    }]
});

var imagesRasterChart = Highcharts.chart('chart-images-raster', {
    chart: {type: 'bar'},
    title: {
        text: 'Среднее время декодирования изображения',
        style: chartStyle.title,
    },
    xAxis: {
        categories: [
            'BMP',
            'PNG',
            'JPEG',
            'WebP',
        ],
        crosshair: true,
        labels: {
            style: {
                fontSize: '24px',
            },
        },
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Время, ms'
        }
    },
    tooltip: {
        pointFormat: '<b>{point.y} ms</b>'
    },
    plotOptions: {
        bar: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '{point.y} ms',
                style: chartStyle.labelStyle
            }
        }
    },
    series: [{
        name: 'Image decode',
        colorByPoint: true,
        data: [33.482, 39.532, 41.118, 89.134],
    }]
});
