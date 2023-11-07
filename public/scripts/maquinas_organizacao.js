function getSelectedValues() {
   const nodeList = document.querySelectorAll("sl-select");
   const selects = [...nodeList, nodeList];
   
   return {
      ordemAaZ: selects[0].value,
      qtdStrikes: selects[1].value,
      emUso: selects[2].value,
      estado: selects[3].value,
      elementos: selects[4]
   }
}

const searchInput = document.getElementById("input_pesquisa");
searchInput.addEventListener('keypress', (e) => {
   if(e.key === "Enter") {
      e.preventDefault;
      pesquisarPorNome();
   }
});
function pesquisarPorNome() {
   let maquinas = document.getElementById('maquinas');
   maquinas.innerHTML = '';
   mostrarTodasMaquinas(localStorage.getItem("instituicao"), searchInput.value).then(() => {
      if(!maquinas.childElementCount) {
         maquinas.innerHTML = `
         <div class="sem-resultado">
         <img src="../assets/img/elements/naufragio.svg" alt="">
         <h2>Nenhum resultado encontrado</h2>
         <h3>Tente utilizar outras opções de filtragem</h3>
         </div>
         `;
      } 
   });
}

function capturarTodasMaquinas(idInstituicao, pesquisa) {
   const s = getSelectedValues();
   console.log(s)
   return new Promise((resolve, reject) => {
      fetch(`/maquinas/capturarTodasMaquinas/`, 
      {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            idInstituicao: idInstituicao,
            ordAlfabetica: s.ordemAaZ,
            qtdStrikes: s.qtdStrikes,
            emUso: s.emUso,
            estado: s.estado,
            pesquisa: pesquisa 
         })
      })
      .then((response) => {
         if(response.ok) { 
            response.json().then((response) => {
               resolve(response);
            });
         }
      })
      .catch((error) => {
         console.log("Erro de requisição.", error)
         reject(error);
      })
   }) 
}

function mostrarTodasMaquinas(idInstituicao, pesquisa = '') {
   const maquinas = document.getElementById("maquinas");

   capturarTodasMaquinas(idInstituicao, pesquisa).then((dadosMaquinas) => {
      console.log(dadosMaquinas);
      dadosMaquinas.forEach(maquina => {
         let id = maquina.id;
         let nome = maquina.nome;
         let emUso = maquina.emUso == 0 ? "OFF" : "ON";
         let qtdStrikes = maquina.qtdStrikes;
         let status = maquina.status;

         const maquinaItem = document.createElement("div");
         maquinaItem.classList.add("maquina-item");
         maquinaItem.onclick = () => {
            sessionStorage.nomeMaquina = nome;
            sessionStorage.idMaquina = id;
            window.location.replace("http://localhost:3333/dashboard/dashboard_maquina.html");
         }

         maquinaItem.innerHTML = `
            <img src="../assets/img/Icone/windows_icon.svg" alt="" class="so">
            <div class="stat">
               <div class="stat-texts">
                  <h2>${nome}</h2>
                  <span class="maquina-stat">Em uso: <highlight class="uso-maquina">${emUso}</highlight> </span>
                  <span class="maquina-stat">Estado: <highlight class="status-maquina">${status}</highlight> </span>
               </div>
               <div class="stat-alerts">
                  <i class="ph ph-warning strikes" data-qtd="${qtdStrikes}"></i>
                  <i class="ph ph-warning strikes" data-qtd="${qtdStrikes}"></i>
                  <i class="ph ph-warning strikes" data-qtd="${qtdStrikes}"></i>
               </div>
            </div>
         `;

         maquinas.appendChild(maquinaItem);

         const uso_maquina = maquinaItem.querySelector(".uso-maquina");
         const strikes = maquinaItem.querySelectorAll(".strikes");
         const status_maquina = maquinaItem.querySelector(".status-maquina");

         if (emUso === "ON") uso_maquina.style.color = "var(--color-blue-500)";

         strikes.forEach((strike, index) => {
            if (index < qtdStrikes) {
               strike.style.color = "red";
            }
         });

         switch (status) {
            case "Crítico":
               status_maquina.style.color = "red";
               break;
            case "Alerta":
               status_maquina.style.color = "yellow";
               break;
            default:
               status_maquina.style.color = "var(--color-green-500)";
               break;
         }
      });
   }).then(() => {
      if(!maquinas.childElementCount) {
         maquinas.innerHTML = `
         <div class="sem-resultado">
         <img src="../assets/img/elements/naufragio.svg" alt="">
         <h2>Nenhum resultado encontrado</h2>
         <h3>Tente utilizar outras opções de filtragem</h3>
         </div>
         `;
      } 
   });
}

getSelectedValues().elementos.forEach((elemento) => {
   elemento.addEventListener('sl-change', event => {
      let maquinas = document.getElementById('maquinas');
      maquinas.innerHTML = '';
      mostrarTodasMaquinas(localStorage.getItem("instituicao"));
   });
})

window.onload = () => {
   mostrarTodasMaquinas(localStorage.getItem("instituicao"))
}