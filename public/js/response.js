/* eslint-disable */
const flags = document.querySelectorAll('.flag-item');
const cflags = document.querySelectorAll('.flag-item-c');

if(flags){
    flags.forEach(flag => {
        flag.addEventListener('click', () => {
            flag.classList.toggle('flag-item-active');
        });
    })
    cflags.forEach(cflag => {
        cflag.addEventListener('click', () => {
            cflag.classList.toggle('flag-item-c-active');
        });
    })
}

const permissions = document.querySelectorAll('.perm-select');
const setUrgencyArrows = () => {
    let circles = document.querySelectorAll('.urgency');
    let icons = {
        "critical": '<i class="fas fa-angle-double-up"></i>',
        "high": '<i class="fas fa-angle-up"></i>',
        "medium": '<i class="fas fa-equals"></i>',
        "low": '<i class="fas fa-minus"></i>'
    };
    circles.forEach((circle) => {
        circle.innerHTML = icons[circle.classList[1]]
    })
}

const sph = document.querySelector('.subset-proj-header');
const pdd = document.querySelector('.proj-dropdown');
if(sph){
    sph.addEventListener('click', () => {
        const a = document.createElement('div');
        if(sph.childNodes[2].childNodes[0].className === "fas fa-chevron-down"){
            a.className = "fas fa-chevron-up";
            pdd.style.zIndex = 99;
            pdd.style.opacity = 1;
        } else {
            a.className = "fas fa-chevron-down";
            pdd.style.zIndex = -1;
            pdd.style.opacity = 0;
        }

        sph.childNodes[2].innerHTML = '';
        sph.childNodes[2].appendChild(a);
    })
}

const setUrgencyButtons = () => {
    let buttons = document.querySelectorAll('.urgency-text');

    buttons.forEach((button) => {
        button.addEventListener('click', function() {
            buttons.forEach((b) => {
                b.classList.remove('ur-active');
            })
            if(!button.classList.contains('ur-active')){
                button.classList.toggle('ur-active');
            }
            
        })
    })
}

let col = {
    "Manager": 'rgb(245, 29, 137)',
    "Admin": 'rgb(209, 41, 41)',
    "Editor": 'rgb(44, 114, 206)'
}


const permCircles = () => {
    permissions.forEach(perm => {
        perm.parentElement.childNodes[0].style.backgroundColor = col[(perm.value.trim())];
    })
}

const responsive = () => {
    if(document.querySelector('.v1-r')){
        document.querySelector('.v1-r').textContent = screen.width < 1500 ? 'Tickets' : 'Ticket Status';
    }
}

const modalUpdateOpen = (s) => {
    const loc = document.querySelector('.cTmodal-location');
    loc.innerHTML = s;
    
}


const runApp = () => {
    setUrgencyArrows();
    setUrgencyButtons();
    responsive();
    permCircles();
}

runApp();

$(document).on('input', '.mt-0', function() {
    document.getElementById('marker-preview-content').textContent = this.value;
    if(document.getElementById('markerPreviewInput').value === '' || document.getElementById('markerPreviewInput').value === ' '){
        document.getElementById('marker-preview-content').textContent = 'preview';
    }
})

window.addEventListener('resize', () => responsive());



