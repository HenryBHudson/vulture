/* eslint-disable */
import '@babel/polyfill';
import {login, register, logout, sendNewCard, createTicket, createMarker, removeUser, changeRole, joinProject, createProject, updateCard, deleteCard, switchProject, updateProject, deleteProject, leaveProject, updateProfile, deleteMarker, updateStatus} from './login';

const loginForm = document.querySelector('.form--login');
const registerForm = document.querySelector('.form--register');
const logoutBtn = document.querySelector('#logout');
const newTicketForm = document.querySelector('.form--newTicket');
const panels = document.querySelectorAll('.panel-body');
const cards = document.querySelectorAll('.panel-item');
const newMarkerForm = document.querySelector('.form--newMarker');
const permissions = document.querySelectorAll('.perm-select');
const removes = document.querySelectorAll('.remove-btn');
// const bans = document.querySelectorAll('.ban-btn');
const selects = document.querySelectorAll('.perm-select');
const joinForm = document.querySelector('.join-project');
const createForm = document.querySelector('.create-project');
const cardForm = document.querySelector('.card-details');
const delCard = document.querySelector('.del-card');
const uProjects = document.querySelectorAll('.proj-item');
const codeT = document.querySelector('.code');
const saveProject = document.querySelector('.save-project');
const delProject = document.querySelector('.del-proj');
const prefsForm = document.querySelector('.prefs-form');
const delMarker = document.querySelector('.del-marker');

window.onload = () => {
    console.log('Updates Status: Online')
    updateStatus('Online');
    setTimeout(() => {
        updateStatus('Idle');
        console.log('Updates Status: Idle')
        setTimeout(() => {
            console.log('Updates Status: Offline')
            updateStatus('Offline');
        }, 180000);
    }, 120000);
}

window.addEventListener('beforeunload', () => {
    updateStatus('Offline');
});

if(panels){
    function sortItems(el){
        var us = ['low','medium','high','critical'];
        var els = el.querySelectorAll('.panel-item');
        var p=[[],[],[],[]],c=[],h=[],m=[],l=[];
        
        for(let x = 0;x < els.length;x++){
            const pinCheck = els[x].childNodes[3].querySelector('.fa-thumbtack');
            if(pinCheck != null){
                var cel = us.indexOf(els[x].getElementsByClassName('urgency')[0].classList[1]);
                p[3-cel].push(els[x])
            } else {
                var cel = us.indexOf(els[x].getElementsByClassName('urgency')[0].classList[1]);
                switch(cel){
                    case 3:
                        c.push(els[x]);
                        break;
                    case 2:
                        h.push(els[x]);
                        break;
                    case 1:
                        m.push(els[x]);
                        break;
                    case 0:
                        l.push(els[x]);
                        break;
                }  
            }
        }



        el.innerHTML = '';

        p[0].forEach((elx) => {
            el.append(elx);
        })
        p[1].forEach((elx) => {
            el.append(elx);
        })
        p[2].forEach((elx) => {
            el.append(elx);
        })
        p[3].forEach((elx) => {
            el.append(elx);
        })

        c.forEach((elx) => {
            el.appendChild(elx);
        })
        h.forEach((elx) => {
            el.appendChild(elx);
        })
        m.forEach((elx) => {
            el.appendChild(elx);
        })
        l.forEach((elx) => {
            el.appendChild(elx);
        })
}
    window.addEventListener('load', () => {
        sortItems(document.getElementById('panel-1'))
        sortItems(document.getElementById('panel-2'))
        sortItems(document.getElementById('panel-3'))
        sortItems(document.getElementById('panel-4'))
    })

    cards.forEach(card => {
        card.addEventListener('dragstart', e => {
            card.classList.add('dragging');
            card.style.animation = 'none'
            const flags = card.childNodes[3].childNodes;
            for(const k in flags){
                if(flags[k].className === 'flag fad fa-check'){
                    card.childNodes[3].removeChild(flags[k])
                }
            }
        })
        card.addEventListener('dragend', e => {
            card.classList.remove('dragging');
            const id = card.childNodes[2].childNodes[1].textContent;
            if(card.parentElement.parentElement.childNodes[0].childNodes[0].textContent.replace(/\s/g, '').toLowerCase() === 'completed'){
                var flag = document.createElement('div')
                flag.className = 'flag fad fa-check'
                flag.setAttribute('data-toggle', 'tooltip');
                flag.setAttribute('data-html', 'true');
                flag.setAttribute('data-placement', 'bottom');
                flag.setAttribute('title', '<b>Completed</b>');
                card.childNodes[3].appendChild(flag);
                card.style.animation = 'completed 1s';
            } 
            sendNewCard(card, id);
            setTimeout(() => {
                card.style.animation = 'none'
            }, 2000);
        })
    })
    
    panels.forEach(panel => {
        panel.addEventListener('dragover', e => {
            e.preventDefault();
            const card = document.querySelector('.dragging');
            panel.appendChild(card);
            sortItems(panel);
        })
    })
}

if(newMarkerForm){
    const c = colour => {
        console.log('yes')
        document.getElementById('marker-preview').style.backgroundColor = `rgba(${colour[0]},${colour[1]},${colour[2]},0.2)`;
        document.getElementById('marker-preview').style.color = `rgb(${colour[0]},${colour[1]},${colour[2]})`;
        document.getElementById('marker-preview-circle').style.backgroundColor = `rgb(${colour[0]},${colour[1]},${colour[2]})`;
    }
    
    var colorPicker = new iro.ColorPicker('#marker-colour', {
        width: 100,
        layoutDirection: "horizontal"
    });
    
    if(permissions){
        let col = {
            "Manager": 'rgb(216, 30, 123)',
            "Admin": 'rgb(209, 41, 41)',
            "Editor": 'rgb(44, 114, 206)'
        }
    
        permissions.forEach(perm => {
            perm.addEventListener('change', () => {
                perm.parentElement.childNodes[0].style.backgroundColor = col[perm.value];
            })
        })
    }
    
    colorPicker.on('color:change', function(color) {
        c([color.rgb["r"].toString(), color.rgb["g"].toString(), color.rgb["b"].toString()]);
    });
}


if(newMarkerForm){
    newMarkerForm.addEventListener('submit', e => {
        e.preventDefault();

        const text = document.getElementById('markerPreviewInput').value;
        
        const c = colorPicker.color.rgb;
        const colour = `${c['r']}, ${c['g']}, ${c['b']}`;

        createMarker(text,colour);
        setTimeout(location.reload(), 1000);
    })
}

if(newTicketForm){
    newTicketForm.addEventListener('submit', e => {
        e.preventDefault();

        document.querySelector('.open-ticket-btn').disabled = true;
        const summary = document.getElementById('summary').value;
        const description = document.getElementById('description').value;
        const urgency = document.querySelector('.select-urgency-ticket').value.toLowerCase();
        const tags = [];
        const panel = document.querySelector('.cTmodal-location').textContent.replace(/\s/g, '').toLowerCase();
        const flags = [];
        const flagItems = document.querySelectorAll('.flag-item-active');

        flagItems.forEach(flag => {
            flags.push(flag.id)
        })

        var tagItems = document.querySelectorAll('.tmc-active');
        tagItems.forEach(tag => {
            tags.push(tag.id);
        })

        createTicket(summary,description,tags,urgency,panel,flags);
    })
}

if(loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if(registerForm){
    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const cpassword = document.getElementById('cpassword').value;
        register(name, email, password, cpassword);
        
    });
}

if(joinForm){
    joinForm.addEventListener('submit', e => {
        e.preventDefault();
        const code = document.getElementById('code').value;
        joinProject(code);
    })
}

if(createForm){
    createForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('project-name').value;
        const type = document.getElementById('project-type').value;
        createProject(name, type);
    })
}

if(logoutBtn) logoutBtn.addEventListener('click', logout);

if(selects){
    selects.forEach(select => {
        select.addEventListener('change', () => {
            changeRole(select.classList[3], select.value.trim());
        })
    });
}

if(delCard){
    delCard.addEventListener('click', () => {
        const id = document.querySelector('.card-modal-id').textContent
        deleteCard(id);
    })
}

if(uProjects){
    uProjects.forEach(project => {
        project.addEventListener('click', () => {
            const code = project.childNodes[1].childNodes[2].textContent;
            if(project.classList.contains('proj-item')){
                switchProject(code);
            } else {
                leaveProject(code);
            }
        })
    })
}

if(cardForm){
    cardForm.addEventListener('submit', e => {
        e.preventDefault();
        const summary = document.querySelector('.card-modal-title').textContent;
        const description = document.querySelector('.desc').innerHTML;
        const urgency = document.querySelector('.select-urgency').value;
        const tags = [];
        const flags = [];
        const flagItems = document.querySelectorAll('.flag-item-c-active');

        flagItems.forEach(flag => {
            flags.push(flag.id)
        })

        const id = document.querySelector('.card-modal-id').textContent;
       
        var selTags = document.querySelectorAll('.mc-active');

        selTags.forEach(tag => {
            tags.push(tag.id);
        })
        document.querySelector('.card-form-btn').disabled = true;
        updateCard(id,summary,description,urgency,tags,flags);
    })
}

if(removes){
    removes.forEach(remove => {
        remove.addEventListener('click', () => {
            removeUser(remove.classList[1]);
        })
    });
    // bans.forEach(ban => {
    //     ban.addEventListener('click', () => {
    //         banUser(ban.classList[1]);
    //     })
    // });
}

if(saveProject){
    saveProject.addEventListener('submit', e => {
        e.preventDefault();
        document.querySelector('.save-project-btn').disabled = true;
        const name = document.querySelector('.settings-name').value;
        const type = document.querySelector('.settings-type').value;
        updateProject(name, type);
    })
}

if(delProject){
    delProject.addEventListener('click', () => {
        deleteProject();
    })
}

if(prefsForm){
    prefsForm.addEventListener('submit', e => {
        e.preventDefault();
        document.querySelector('.prefs-btn').disabled = true;
        const name = document.querySelector('.form-prefs-name').value;
        const email = document.querySelector('.form-prefs-email').value;
        updateProfile(name, email);
    })
}

if(delMarker){
    delMarker.addEventListener('click', () => {
        const t = document.querySelector('.mcc-expand').textContent;
        deleteMarker(t);
    })
}

