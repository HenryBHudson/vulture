var ctx = document.getElementById('ticketsChart');

var ctx2 = document.getElementById('createdChart').getContext('2d');

var gradientRed = ctx.getContext('2d').createLinearGradient(0, 0, 200, 200);
gradientRed.addColorStop(0, 'rgba(255, 85, 184, 0.9)');
gradientRed.addColorStop(1, 'rgba(255, 135, 135, 0.8)');

var gradientBlue = ctx.getContext('2d').createLinearGradient(0, 0, 350, 350);
gradientBlue.addColorStop(0, 'rgba(90, 50, 255, 0.9)');
gradientBlue.addColorStop(1, 'rgba(130, 135, 255, 0.8)');

var gradientGreen = ctx.getContext('2d').createLinearGradient(0, 0, 350, 350);
gradientGreen.addColorStop(0, 'rgba(90, 255, 255, 0.9)');
gradientGreen.addColorStop(1, 'rgba(80, 180, 255, 0.8)');

var gradientPink = ctx.getContext('2d').createLinearGradient(0, 0, 350, 350);
gradientPink.addColorStop(0, 'rgba(255, 50, 255, 0.9)');
gradientPink.addColorStop(1, 'rgba(255, 100, 255, 0.5)');

var myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Pending', 'In Progress', 'Issues', 'Completed'],
        datasets: [{
            data: [0,0,0,5],
            backgroundColor: [
                gradientPink,
                gradientBlue,
                gradientRed,
                gradientGreen
            ],
            borderWidth: 0
        }]
    },
    options: {
        legend: {
            display: false
        },
        cutoutPercentage: 75
    }
});


var gradient = ctx2.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(107, 98, 255, 0.5)');   
    gradient.addColorStop(1, 'rgba(107, 98, 255, 0)');

var data = {
    labels : ["28th Dec","29th Dec","30th Dec","31st Dec","1st Jan","2nd Jan","Today"],
    datasets: [
        {
            backgroundColor : gradient,
            strokeColor : "#ff6c23",
            pointColor : "#fff",
            pointStrokeColor : "#ff6c23",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "#ff6c23",
            data : [1,3,1,2,2,2,6],
            pointRadius: 4
        }
    ]
};

var options = {
    legend: {
            display: false
    },
    responsive: true,
    datasetStrokeWidth : 1,
    pointDotStrokeWidth : 4,
    tooltipFillColor: "rgba(0,0,0,0.5)",
    tooltipFontStyle: "bold",
    tooltipTemplate: "<%if (label){%><%=label + ' hod' %>: <%}%><%= value + '°C' %>",
    scaleLabel : "<%= Number(value).toFixed(0).replace('.', ',') + '°C'%>",
    scales: {
        xAxes: [{
            gridLines: {
                color: "rgba(0, 0, 0, 0.02)",
            }
        }],
        yAxes: [{
            gridLines: {
                color: "rgba(0, 0, 0, 0.02)",
            },
            ticks: {
                beginAtZero: true,
                stepSize: 1
            }
        }]
    },
    elements: {
        line: {
            tension: 0.3
        }
    }
};


var line = new Chart(ctx2, {
    type: 'line',
    data,
    options
})
