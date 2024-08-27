
/* Código JavaScript 
<!-- Mestrado de Design e Multimédia, foi desenvolvida uma experiência imersiva de Realidade Virtual, 
relativa à Arte Emblemática da Casa Museu Bissaya Barreto por Jorge Antunes -->
*/

//-- Função Contrala animação dos emblemas Retornando á Cen0 e atribui o audio e legendas--->
AFRAME.registerComponent('scene-controller', {
    init: function () {
        var el = this.el;
        var currentSound = null;
        var currentSceneIndex = 0;

        // Função para atualizar a legenda
        function updateLegend(sceneNumber) {
            const legendNumber = sceneNumber.toString().padStart(2, '0');
            const legendImageSrc = `./assets/PaineisInfo/Painel${legendNumber}Legenda.png`;

            // Atualiza a imagem de legenda 2D
            const legendImage = document.getElementById('legend-image');
            if (legendImage) {
                legendImage.src = legendImageSrc;
                legendImage.alt = `Legenda da cena ${sceneNumber}`;
            }

            // Atualiza a imagem de legenda 3D (se aplicável)
            const legendaImage3D = document.getElementById('LegendaImage3D');
            if (legendaImage3D) {
                legendaImage3D.setAttribute('src', legendImageSrc);
            }

            // Atualiza a imagem de legenda 3D
            const legendPlane = document.getElementById('legend-plane');
            if (legendPlane) {
                legendPlane.setAttribute('src', legendImageSrc);
            }

            console.log(`Atualizando legenda para cena ${sceneNumber}: ${legendImageSrc}`);
        }

        // Função para tocar o som
        function playSound(sceneNumber) {
            if (currentSound) {
                currentSound.components.sound.stopSound();
            }
            currentSound = document.querySelector('#sound' + sceneNumber);
            if (currentSound && currentSound.components.sound) {
                console.log('Playing sound for scene:', sceneNumber);
                currentSound.components.sound.playSound();
            } else {
                console.warn('Sound component not found for scene:', sceneNumber);
            }
        }

        // Configurar listeners para cada painel
        for (var i = 1; i <= 10; i++) {
            (function (sceneNumber) {
                el.addEventListener('hitPainel' + sceneNumber, function () {
                    console.log('Entering scene:', sceneNumber);
                    el.setAttribute('animation-mixer', 'clip: Cena' + sceneNumber + '; startAt: 100;');
                    playSound(sceneNumber);
                    updateLegend(sceneNumber);
                    currentSceneIndex = sceneNumber;
                });
            })(i);
        }

        // Listener genérico para sair de qualquer painel
        el.addEventListener('exitPainel', function () {
            console.log('Exiting to scene 0');
            el.setAttribute('animation-mixer', 'clip: Cena0; startAt: 0;');
            playSound(0);
            updateLegend(0);
            currentSceneIndex = 0;
        });

        // Adicionar funções para navegação manual (botões)
        this.changeScene = function (direction) {
            if (direction === 'next') {
                currentSceneIndex = (currentSceneIndex + 1) % 11; // 11 porque temos cenas de 0 a 10
            } else if (direction === 'prev') {
                currentSceneIndex = (currentSceneIndex - 1 + 11) % 11;
            }
            el.setAttribute('animation-mixer', `clip: Cena${currentSceneIndex}; startAt: 100;`);
            playSound(currentSceneIndex);
            updateLegend(currentSceneIndex);
        };

        // Adicionar event listeners para os botões de navegação
        const prevButton = document.querySelector('.nav-button:first-child');
        const nextButton = document.querySelector('.nav-button:last-child');
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => this.changeScene('prev'));
            nextButton.addEventListener('click', () => this.changeScene('next'));
        }


        // para intersecçao com o controlador
        if (prevButton && nextButton) {
            prevButton.addEventListener('hitstart', () => this.changeScene('prev'));
            nextButton.addEventListener('histart', () => this.changeScene('next'));
        }
    }
});

//-- Função Contrala Palco Visibilidade Controlador--->
AFRAME.registerComponent('panel-visibility-controller', {
    init: function () {
        this.palcoEmblemaPortable = document.querySelector('#PalcoEmblemaPortable');
        this.legendaImage3D = document.querySelector('#LegendaImage3D');
        this.isNearPanel = false;
        this.isNearPalcoEmblema = false;
        this.currentPanelNumber = 0;

        // Inicialmente, esconda o PalcoEmblemaPortable e a legenda
        this.palcoEmblemaPortable.setAttribute('visible', false);
        this.legendaImage3D.setAttribute('visible', false);

        // Eventos para os painéis
        for (let i = 1; i <= 10; i++) {
            this.el.addEventListener(`hitPainelPortable${i}`, () => this.enterPanel(i));
            this.el.addEventListener(`exitPainelPortable${i}`, this.exitPanel.bind(this));
        }

        // Eventos para o PalcoEmblema_1
        const palcoEmblema1 = document.querySelector('#PalcoEmblema_1');
        palcoEmblema1.addEventListener('hitstart', this.enterPalcoEmblema.bind(this));
        palcoEmblema1.addEventListener('hitend', this.exitPalcoEmblema.bind(this));
    },

    enterPanel: function (panelNumber) {
        this.isNearPanel = true;
        this.currentPanelNumber = panelNumber;
        this.updateVisibility();
    },

    exitPanel: function () {
        this.isNearPanel = false;
        this.currentPanelNumber = 0;
        this.updateVisibility();
    },

    enterPalcoEmblema: function () {
        this.isNearPalcoEmblema = true;
        this.updateVisibility();
    },

    exitPalcoEmblema: function () {
        this.isNearPalcoEmblema = false;
        this.updateVisibility();
    },

    updateVisibility: function () {
        // Mostrar palco quando perto de um painel, esconder a legenda
        if (this.isNearPanel) {
            this.palcoEmblemaPortable.setAttribute('visible', true);
            this.legendaImage3D.setAttribute('visible', false);
        }
        // Mostrar legenda quando perto do PalcoEmblema_1, esconder o palco
        else if (this.isNearPalcoEmblema) {
            this.palcoEmblemaPortable.setAttribute('visible', false);
            this.legendaImage3D.setAttribute('visible', true);
            // Usar a legenda correspondente ao último painel visitado
            const legendaSrc = this.currentPanelNumber > 0 ?
                `#iPainelLegenda${this.currentPanelNumber.toString().padStart(2, '0')}` :
                '#iPainelLegenda00';
            this.legendaImage3D.querySelector('#legend-plane').setAttribute('src', legendaSrc);
        }
        // Esconder ambos quando não estiver perto de nenhum
        else {
            this.palcoEmblemaPortable.setAttribute('visible', false);
            this.legendaImage3D.setAttribute('visible', false);
        }
    }
});

//-- Função torna invisivel a esfera 360 exteriormente da entrada ---------------------------------------------->
AFRAME.registerComponent("cloak", {
    schema: { type: "selectorAll" },
    setRenderOrder: function (el, order) {
        let mesh = el.getObject3D("mesh");
        let _this = this;
        if (!mesh) {
            el.addEventListener("model-loaded", function () {
                _this.setRenderOrder(el, order);
            });
            return;
        }
        console.log("setting render order on ", el, "to ", order);
        mesh.renderOrder = order;
    },
    init: function () {
        console.log("Setting cloak");
        let cloak = this.el;

        console.log("Cloak loaded");
        let mesh = cloak.getObject3D("mesh"); // grab the mesh
        if (mesh === undefined) {
            console.log("no mesh");
            return;
        } // return if no mesh :(
        mesh.traverse(function (node) {
            // traverse through and apply settings
            if (node.isMesh && node.material) {
                // make sure the element can be a cloak
                console.log(node);
                node.material.colorWrite = false;
                node.material.needsUpdate = true;
            }
        });
        mesh.renderOrder = 1;
        console.log(cloak.children);
        for (const child of this.data) {
            this.setRenderOrder(child, 11);
        }
    }
});

/* <-- Mestrado de Design e Multimédia, foi desenvolvida uma experiência imersiva de Realidade Virtual, 
relativa à Arte Emblemática da Casa Museu Bissaya Barreto.
por Jorge Antunes -->*/