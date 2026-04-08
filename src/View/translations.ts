const englishTranslations = {
    updater: {
        migrated: "Migrated",
    },

    general: {
        deleteItemButtonAudioLabel: "delete item",
        searchButtonAudioLabel: "search",

        abortButton: "Abort",
        cancelButton: "Cancel",
        closeButton: "Close",
        backButton: "Back",

        continueButton: "Continue",
        confirmButton: "Confirm",
        saveButton: "Save",
        setButton: "Set",

        reloadAppButton: "Reload App",

        fileVersionLabel: "Version",
        searchLabel: "Search",
        waitingLabel: "Waiting...",

        restoreConnection: "Restore connection",
    },

    regional: {
        weekdays: {
            full: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ],
            abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
    },

    homePage: {
        appName: "Comms",

        ///

        overviewHeadline: "Overview",

        serverAddress: "Server address",
        serverAddressPlaceholder: "wss://192.168.0.69:3000",
        connectAudioLabel: "connect to server",
        disconnectAudioLabel: "disconnect from server",
        manageConnectionsAudioLabel: "manage connections",

        yourNameLabel: "Your name",
        yourNamePlaceholder: "Jane Doe",
        setNameButtonAudioLabel: "set name",

        firstDayOfWeekLabel: "First day of week",

        settingsButton: "Settings",
        manageStorageButton: "Manage storage",
        transferDataButton: "Data Transfer",

        scrollToChatButton: "Chats",

        ///

        backToOverviewAudioLabel: "go back to overview",
        chatsHeadline: "Chats",

        addChatAudioLabel: "name of new chat",
        addChatPlaceholder: "Add chat",
        addChatButton: "Add chat",
    },

    settings: {
        pages: {
            appearance: "Appearance",
            regional: "Language+Region",
            info: "About Comms",
        },
    },

    connectionModal: {
        connectionModalHeadline: "Manage Connections",

        ///

        connectButtonAudioLabel: "connect",
    },

    dataTransferModal: {
        transferDataHeadline: "Data Transfer",
        selectionDescription: "Select the data that you want to transfer.",
        dataEntryDescription: "Enter this data on the other device.",
        dataEntryInputDescription:
            "Enter the data displayed on the other device.",

        notConnectedError: "You are not connected to any server.",

        ///

        fromThisDeviceButton: "From this device",
        toThisDeviceButton: "To this device",

        ///

        generalHeadline: "General",

        connectionData: "Connection Data",
        settingsData: "Settings Data",

        chatsHeadline: "Chats",

        ///

        transferChannelHeadline: "Transfer Chanel",
        transferKeyHeadline: "Transfer Encryption Key",

        sendButton: "Send",
        sendAgainButton: "Send again",

        ///

        filesSentCount: (count: number) => `Files sent: ${count}.`,
        allFilesSent: "Done.",

        filesReceivedCount: (count: number) => `Files received: ${count}.`,
    },

    storage: {
        noItemSelected: "No item selected",
        notAFile: "(not a file)",
        contentEmpty: "(empty)",

        path: "Path",
        content: "Content",

        deleteItem: "Delete item",

        removeJunkButton: "Delete junk files",
    },

    chatPage: {
        closeChatAudioLabe: "close chat",
        chatSettingsAudioLabel: "chat settings",

        pages: {
            settings: "Settings",
            messages: "Messages",
            tasks: "Tasks",
            calendar: "Calendar",
        },

        settings: {
            settingsHeadline: "Settings",

            primaryChannelLabel: "Primary channel",
            setPrimaryChannelButtonAudioLabel: "set primary channel",

            newSecondaryChannelPlaceholder: "Add secondary channel",
            newSecondaryChannelAudioLabel: "name of new secondary channel",
            addSecondaryChannelButtonAudioLabel: "add secondary channel",

            encryptionKeyLabel: "Encryption key",
            setEncryptionKeyButtonAudioLabel: "set encryption key",
            showEncryptionKey: "Show encryption key",

            deleteChatButton: "Delete entire chat",
        },

        message: {
            messagesHeadline: "Messages",

            ///

            composerInputPlaceholder: "Type a message...",
            sendMessageButtonAudioLabel: "send message",

            ///

            showMessageInfoButtonAudioLabel: "show message info",
            messageInfoHeadline: "Message Info",

            sentBy: "Sent by",
            timeSent: "Time sent",
            channel: "Channel",
            messageContent: "Message content",

            copyMessageButton: "Copy message",
            resendMessageButton: "Resend message",
            decryptMessageButton: "Decrypt message",
            deleteMessageButton: "Delete message",

            //

            thumbsUpReaction: "Reaction: thumbs up",
            checkReaction: "Reaction: check",
            stopReaction: "Reaction: stop sign",
            attentionReaction: "Reaction: exclamation mark",
            doubleAttentionReaction: "Reaction: double exclamation mark",
            questionReaction: "Reaction: question mark",
        },

        task: {
            newBoardNamePlaceholder: "Create a board",
            createBoardButtonAudioLabel: "create board",

            ///

            noBoardSelected: "No board selected",
            boardNotFound: "Board not found",

            ///

            closeBoardButtonAudioLabel: "close board",
            toggleBoardButtonAudioLabel: "toggle board list",
            showBoardSettingsButtonAudioLabel: "show board settigns",

            listViewButtonAudioLabel: "list view",
            kanbanViewButtonAudioLabel: "kanban view",
            statusViewButtonAudioLabel: "status grid view",

            filterTasksButtonAudioLabel: "filter tasks",
            createTaskButtonAudioLabel: "create new task",

            ///

            boardSettingsHeadline: "Board Settings",
            boardNameInputLabel: "Board name",
            deleteBoardButton: "Delete board and all tasks",

            ///

            taskSettingsHeadline: "Edit Task",

            taskNameLabel: "Title",
            taskBoardLabel: "Board",

            taskCategoryLabel: "Category",
            taskStatusLabel: "Status",
            taskPriorityLabel: "Priority",

            taskDescriptionLabel: "Description",

            taskDateLabel: "Date",
            taskTimeLabel: "Time",

            deleteTaskButton: "Delete task",

            ///

            filterTasksHeadline: "Filter Tasks",

            ///

            renameCategoryInputPlaceholder: "Rename category",
            renameStatusInputPlaceholder: "Rename status",
        },

        calendar: {
            eventsBoard: "Events",

            ///

            todayButtonAudioLabel: "go to today",

            previousMonthButtonAudioLabel: "previous month",
            nextMonthButtonAudioLabel: "next month",

            yearInputAudioLabel: "year",
            monthInputAudioLabel: "month",

            yearInputPlaceholder: "2000",
            monthInputPlaceholder: "01",

            ///

            searchEventsHeadline: "Search Events",

            ///

            events: "Events",
            noEvents: "No events",
        },
    },
};

const allTranslations: { [language: string]: typeof englishTranslations } = {
    en: englishTranslations,

    de: {
        updater: {
            migrated: "Migriert",
        },

        general: {
            deleteItemButtonAudioLabel: "element löschen",
            searchButtonAudioLabel: "suchen",

            abortButton: "Abbrechen",
            cancelButton: "Abbrechen",
            closeButton: "Schließen",
            backButton: "Zurück",

            continueButton: "Weiter",
            confirmButton: "Bestätigen",
            saveButton: "Speichern",
            setButton: "OK",

            reloadAppButton: "Neu laden",

            fileVersionLabel: "Version",
            searchLabel: "Suche",
            waitingLabel: "Warten...",

            restoreConnection: "Verbindung wiederherstellen",
        },

        regional: {
            weekdays: {
                full: [
                    "Sonntag",
                    "Montag",
                    "Dienstag",
                    "Mittwoch",
                    "Donnerstag",
                    "Freitag",
                    "Samstag",
                ],
                abbreviated: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            },
        },

        homePage: {
            appName: "Comms",

            overviewHeadline: "Übersicht",

            serverAddress: "Serveradresse",
            serverAddressPlaceholder: "wss://192.168.0.69:3000",
            connectAudioLabel: "mit Server verbinden",
            disconnectAudioLabel: "vom Server trennen",
            manageConnectionsAudioLabel: "Verbindungen verwalten",

            yourNameLabel: "Dein Name",
            yourNamePlaceholder: "Max Mustermann",
            setNameButtonAudioLabel: "Name speichern",

            firstDayOfWeekLabel: "Erster Wochentag",

            settingsButton: "Einstellungen",
            manageStorageButton: "Daten verwalten",
            transferDataButton: "Datenübertragung",

            scrollToChatButton: "Chats",

            backToOverviewAudioLabel: "zurück zur übersicht",
            chatsHeadline: "Chats",

            addChatAudioLabel: "Name des neuen Chats",
            addChatPlaceholder: "Chat hinzufügen",
            addChatButton: "Chat hinzufügen",
        },

        settings: {
            pages: {
                appearance: "Erscheinungsbild",
                regional: "Sprache+Region",
            info: "Über Comms",
            },
        },

        connectionModal: {
            connectionModalHeadline: "Verbindungen verwalten",

            connectButtonAudioLabel: "verbinden",
        },

        dataTransferModal: {
            transferDataHeadline: "Datenübertragung",
            selectionDescription:
                "Wähle die Daten aus, die du übertragen möchtest.",
            dataEntryDescription:
                "Gib diese Informationen auf dem anderen Gerät ein.",
            dataEntryInputDescription:
                "Gib die auf dem anderen Gerät angezeigten Informationen ein.",

            notConnectedError: "Du bist mit keinem Server verbunden.",

            fromThisDeviceButton: "Von diesem Gerät",
            toThisDeviceButton: "An dieses Gerät",

            generalHeadline: "Allgemein",

            connectionData: "Verbindungsdaten",
            settingsData: "Einstellungen",

            chatsHeadline: "Chats",

            transferChannelHeadline: "Übertragungskanal",
            transferKeyHeadline: "Schlüssel",

            sendButton: "Senden",
            sendAgainButton: "Erneut senden",

            filesSentCount: (count) => `Dateien gesendet: ${count}.`,
            allFilesSent: "Fertig.",

            filesReceivedCount: (count) => `Dateien empfangen: ${count}.`,
        },

        storage: {
            noItemSelected: "Kein Element ausgewählt",
            notAFile: "(keine Datei)",
            contentEmpty: "(leer)",

            path: "Pfad",
            content: "Inhalt",

            deleteItem: "Element löschen",

            removeJunkButton: "Datenmüll löschen",
        },

        chatPage: {
            closeChatAudioLabe: "Chat schließen",
            chatSettingsAudioLabel: "Chateinstellungen",

            pages: {
                settings: "Einstellungen",
                messages: "Nachrichten",
                tasks: "Aufgaben",
                calendar: "Kalender",
            },

            settings: {
                settingsHeadline: "Einstellungen",

                primaryChannelLabel: "Hauptkanal",
                setPrimaryChannelButtonAudioLabel: "Hauptkanal festlegen",

                newSecondaryChannelPlaceholder: "Sekundären Kanal hinzufügen",
                newSecondaryChannelAudioLabel:
                    "Name des neuen sekundären Kanals",
                addSecondaryChannelButtonAudioLabel:
                    "Sekundären Kanal hinzufügen",

                encryptionKeyLabel: "Schlüssel",
                setEncryptionKeyButtonAudioLabel: "Schlüssel festlegen",
                showEncryptionKey: "Schlüssel anzeigen",

                deleteChatButton: "Gesamten Chat löschen",
            },

            message: {
                messagesHeadline: "Nachrichten",

                composerInputPlaceholder: "Schreib eine Nachricht...",
                sendMessageButtonAudioLabel: "nachricht senden",

                showMessageInfoButtonAudioLabel: "nachrichteninfo anzeigen",
                messageInfoHeadline: "Nachrichteninfo",

                sentBy: "Gesendet von",
                timeSent: "Sendezeit",
                channel: "Kanal",
                messageContent: "Nachrichteninhalt",

                copyMessageButton: "Nachricht kopieren",
                resendMessageButton: "Nachricht erneut senden",
                decryptMessageButton: "Nachricht entschlüsseln",
                deleteMessageButton: "Nachricht löschen",

                //

                thumbsUpReaction: "Reaktion: Daumen hoch",
                checkReaction: "Reaktion: Haken",
                stopReaction: "Reaktion: Stopp",
                attentionReaction: "Reaktion: Ausrufezeichen",
                doubleAttentionReaction: "Reaktion: doppeltes Ausrufezeichen",
                questionReaction: "Reaktion: Fragezeichen",
            },

            task: {
                newBoardNamePlaceholder: "Board erstellen",
                createBoardButtonAudioLabel: "board erstellen",

                noBoardSelected: "Kein Board ausgewählt",
                boardNotFound: "Board nicht gefunden",

                closeBoardButtonAudioLabel: "board schließen",
                toggleBoardButtonAudioLabel: "board-liste ein/ausblenden",
                showBoardSettingsButtonAudioLabel:
                    "Board-Einstellungen anzeigen",

                listViewButtonAudioLabel: "Listenansicht",
                kanbanViewButtonAudioLabel: "Kanban-Ansicht",
                statusViewButtonAudioLabel: "Statusrasteransicht",

                filterTasksButtonAudioLabel: "Aufgaben filtern",
                createTaskButtonAudioLabel: "Neue Aufgabe erstellen",

                boardSettingsHeadline: "Board-Einstellungen",
                boardNameInputLabel: "Boardname",
                deleteBoardButton: "Board und alle Aufgaben löschen",

                taskSettingsHeadline: "Aufgabe bearbeiten",

                taskNameLabel: "Titel",
                taskBoardLabel: "Board",

                taskCategoryLabel: "Kategorie",
                taskStatusLabel: "Status",
                taskPriorityLabel: "Priorität",

                taskDescriptionLabel: "Beschreibung",

                taskDateLabel: "Datum",
                taskTimeLabel: "Uhrzeit",

                deleteTaskButton: "Aufgabe löschen",

                filterTasksHeadline: "Aufgaben filtern",

                renameCategoryInputPlaceholder: "Kategorie umbenennen",
                renameStatusInputPlaceholder: "Status umbenennen",
            },

            calendar: {
                eventsBoard: "Ereignisse",

                ///

                todayButtonAudioLabel: "gehe zu heute",

                previousMonthButtonAudioLabel: "vorheriger monat",
                nextMonthButtonAudioLabel: "nächster monat",

                yearInputAudioLabel: "Jahr",
                monthInputAudioLabel: "Monat",

                yearInputPlaceholder: "2000",
                monthInputPlaceholder: "01",

                searchEventsHeadline: "Ereignisse suchen",

                events: "Ereignisse",
                noEvents: "Keine Ereignisse",
            },
        },
    },
    es: {
        updater: {
            migrated: "Migrado",
        },

        general: {
            deleteItemButtonAudioLabel: "eliminar elemento",
            searchButtonAudioLabel: "buscar",

            abortButton: "Abortar",
            cancelButton: "Cancelar",
            closeButton: "Cerrar",
            backButton: "Atrás",

            continueButton: "Continuar",
            confirmButton: "Confirmar",
            saveButton: "Guardar",
            setButton: "OK",

            reloadAppButton: "Recargar app",

            fileVersionLabel: "Versión",
            searchLabel: "Buscar",
            waitingLabel: "Esperando...",

            restoreConnection: "Conectar de nuevo",
        },

        regional: {
            weekdays: {
                full: [
                    "Domingo",
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                ],
                abbreviated: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
            },
        },

        homePage: {
            appName: "Comms",

            overviewHeadline: "Resumen",

            serverAddress: "Dirección del servidor",
            serverAddressPlaceholder: "wss://192.168.0.69:3000",
            connectAudioLabel: "conectar al servidor",
            disconnectAudioLabel: "desconectar del servidor",
            manageConnectionsAudioLabel: "gestionar conexiones",

            yourNameLabel: "Tu nombre",
            yourNamePlaceholder: "Juan Pérez",
            setNameButtonAudioLabel: "establecer nombre",

            firstDayOfWeekLabel: "Primer día de la semana",

            settingsButton: "Ajustes",
            manageStorageButton: "Gestionar almacenamiento",
            transferDataButton: "Transferencia de datos",

            scrollToChatButton: "Chats",

            backToOverviewAudioLabel: "volver al resumen",
            chatsHeadline: "Chats",

            addChatAudioLabel: "nombre del nuevo chat",
            addChatPlaceholder: "Añadir chat",
            addChatButton: "Añadir chat",
        },

        settings: {
            pages: {
                appearance: "Aspecto",
                regional: "Idioma+Región",
                info: "Sobre Comms",
            },
        },
        connectionModal: {
            connectionModalHeadline: "Gestionar Conexiones",

            connectButtonAudioLabel: "conectar",
        },

        dataTransferModal: {
            transferDataHeadline: "Transferencia de Datos",
            selectionDescription:
                "Selecciona los datos que quieres transferir.",
            dataEntryDescription:
                "Introduce estos datos en el otro dispositivo.",
            dataEntryInputDescription:
                "Introduce los datos mostrados en el otro dispositivo.",

            notConnectedError: "No estás conectado a ningún servidor.",

            fromThisDeviceButton: "Desde este dispositivo",
            toThisDeviceButton: "A este dispositivo",

            generalHeadline: "General",

            connectionData: "Datos de Conexión",
            settingsData: "Datos de Configuración",

            chatsHeadline: "Chats",

            transferChannelHeadline: "Canal de Transferencia",
            transferKeyHeadline: "Clave de Encriptación de Transferencia",

            sendButton: "Enviar",
            sendAgainButton: "Enviar otra vez",

            filesSentCount: (count) => `Archivos enviados: ${count}.`,
            allFilesSent: "Hecho.",

            filesReceivedCount: (count) => `Archivos recibidos: ${count}.`,
        },

        storage: {
            noItemSelected: "Ningún elemento seleccionado",
            notAFile: "(no es un archivo)",
            contentEmpty: "(vacío)",

            path: "Ruta",
            content: "Contenido",

            deleteItem: "Eliminar elemento",

            removeJunkButton: "Eliminar archivos basura",
        },

        chatPage: {
            closeChatAudioLabe: "cerrar chat",
            chatSettingsAudioLabel: "configuración del chat",

            pages: {
                settings: "Configuración",
                messages: "Mensajes",
                tasks: "Tareas",
                calendar: "Calendario",
            },

            settings: {
                settingsHeadline: "Configuración",

                primaryChannelLabel: "Canal principal",
                setPrimaryChannelButtonAudioLabel: "establecer canal principal",

                newSecondaryChannelPlaceholder: "Añadir canal secundario",
                newSecondaryChannelAudioLabel:
                    "nombre del nuevo canal secundario",
                addSecondaryChannelButtonAudioLabel: "añadir canal secundario",

                encryptionKeyLabel: "Clave de encriptación",
                setEncryptionKeyButtonAudioLabel:
                    "establecer clave de encriptación",
                showEncryptionKey: "Mostrar clave de encriptación",

                deleteChatButton: "Eliminar todo el chat",
            },

            message: {
                messagesHeadline: "Mensajes",

                composerInputPlaceholder: "Escribe un mensaje...",
                sendMessageButtonAudioLabel: "enviar mensaje",

                showMessageInfoButtonAudioLabel:
                    "mostrar información del mensaje",
                messageInfoHeadline: "Información del Mensaje",

                sentBy: "Enviado por",
                timeSent: "Hora de envío",
                channel: "Canal",
                messageContent: "Contenido del mensaje",

                copyMessageButton: "Copiar mensaje",
                resendMessageButton: "Reenviar mensaje",
                decryptMessageButton: "Desencriptar mensaje",
                deleteMessageButton: "Eliminar mensaje",

                //

                thumbsUpReaction: "Reacción: pulgar hacia arriba",
                checkReaction: "Reacción: marca de verificación",
                stopReaction: "Reacción: signo de parada",
                attentionReaction: "Reaccion: signo de atención",
                doubleAttentionReaction: "Reaccion: signo de atención doble",
                questionReaction: "Reaccion: signo de interrogación",
            },

            task: {
                newBoardNamePlaceholder: "Crear un tablero",
                createBoardButtonAudioLabel: "crear tablero",

                noBoardSelected: "Ningún tablero seleccionado",
                boardNotFound: "Tablero no encontrado",

                closeBoardButtonAudioLabel: "cerrar tablero",
                toggleBoardButtonAudioLabel:
                    "mostrar o ocultar lista de tableros",
                showBoardSettingsButtonAudioLabel:
                    "mostrar configuración del tablero",

                listViewButtonAudioLabel: "vista de lista",
                kanbanViewButtonAudioLabel: "vista kanban",
                statusViewButtonAudioLabel: "vista de cuadrícula de estado",

                filterTasksButtonAudioLabel: "filtrar tareas",
                createTaskButtonAudioLabel: "crear nueva tarea",

                boardSettingsHeadline: "Configuración del Tablero",
                boardNameInputLabel: "Nombre del tablero",
                deleteBoardButton: "Eliminar tablero y todas las tareas",

                taskSettingsHeadline: "Editar Tarea",

                taskNameLabel: "Título",
                taskBoardLabel: "Tablero",

                taskCategoryLabel: "Categoría",
                taskStatusLabel: "Estado",
                taskPriorityLabel: "Prioridad",

                taskDescriptionLabel: "Descripción",

                taskDateLabel: "Fecha",
                taskTimeLabel: "Hora",

                deleteTaskButton: "Eliminar tarea",

                filterTasksHeadline: "Filtrar Tareas",

                renameCategoryInputPlaceholder: "Renombrar categoría",
                renameStatusInputPlaceholder: "Renombrar estado",
            },

            calendar: {
                eventsBoard: "Eventos",

                ///

                todayButtonAudioLabel: "ir a hoy",

                previousMonthButtonAudioLabel: "mes anterior",
                nextMonthButtonAudioLabel: "mes siguiente",

                yearInputAudioLabel: "año",
                monthInputAudioLabel: "mes",

                yearInputPlaceholder: "2000",
                monthInputPlaceholder: "01",

                searchEventsHeadline: "Buscar Eventos",

                events: "Eventos",
                noEvents: "No hay eventos",
            },
        },
    },
};

const language = navigator.language.substring(0, 2);
export const translations = allTranslations[language] || allTranslations.en;
