PRODUCT REQUIREMENTS DOCUMENT
LiveRoom AI
Entrevistas técnicas en vivo con evaluación asistida por IA
Versión: 1.0 - borrador de producto
Estado: Para validación de founders, UX e ingeniería
Fecha: 29/08/2026
Propietario: Equipo de Producto
 
Resumen ejecutivo
LiveRoom AI permite a un entrevistador conducir una prueba técnica de live coding con varios candidatos dentro de una misma sesión, observarlos en tiempo real y recibir un reporte respaldado por evidencias. Cada candidato trabaja en un entorno aislado; el entrevistador conserva una vista consolidada y puede intervenir cuando alguien queda bloqueado.
Decisión de producto. El MVP prioriza entrevistas técnicas de software, hasta tres candidatos por sesión, editor de código aislado, audio, progreso visible y un informe de IA posterior. El video, la ejecución en múltiples lenguajes y las entrevistas masivas se incorporan progresivamente.

 
Índice
1. Problema y oportunidad
2. Visión, objetivos y principios
3. Usuarios y trabajos por resolver
4. Alcance del MVP
5. Experiencia y flujos principales
6. Requisitos funcionales
7. Sistema de IA y evaluación
8. Tiempo real y estados de la sesión
9. Datos y arquitectura conceptual
10. Requisitos no funcionales
11. Privacidad, seguridad y uso responsable
12. Métricas, aceptación y roadmap
13. Riesgos, dependencias y decisiones abiertas

 
1. Problema y oportunidad
Las entrevistas de live coding consumen mucho tiempo de un entrevistador senior. Cuando existen varios candidatos, debe observar cada proceso, interpretar pausas y errores, recordar qué ayudas brindó y revisar una grabación o historial de código al finalizar. Esto introduce carga operativa, sesgo de memoria y pérdida de señales relevantes.
El candidato, a su vez, puede quedarse detenido por un problema de entorno, una ambigüedad en el enunciado o un error no relacionado con su capacidad técnica. En una dinámica concurrente, el entrevistador necesita detectar esa situación sin vigilar manualmente todas las pantallas.
Dolor
Consecuencia
Respuesta de LiveRoom AI
Supervisión uno a uno
Baja capacidad y entrevistas largas
Panel con hasta tres espacios aislados y estado consolidado.
Evaluación poco trazable
Decisiones basadas en recuerdo
Evidencia: cambios, ejecuciones, transcripción y criterios.
Bloqueos invisibles
Tiempo perdido y experiencia injusta
Alertas por inactividad, errores repetidos o pedido de ayuda.
Crear pruebas consume tiempo
Variación de calidad entre entrevistas
Generación guiada de retos, rúbrica y casos de prueba.

 
2. Visión, objetivos y principios
2.1 Visión
Ser la capa de coordinación y evidencia para entrevistas técnicas en vivo: una herramienta que deja al entrevistador concentrarse en el razonamiento humano, mientras el sistema registra el proceso, alerta sobre bloqueos y sintetiza hallazgos verificables.
2.2 Objetivos de producto
·       Permitir una sesión técnica con hasta tres candidatos y un entrevistador, con latencia perceptiblemente baja.
·       Reducir el tiempo de preparación mediante generación controlada de pruebas y rúbricas.
·       Dar visibilidad accionable del avance sin que el entrevistador revise manualmente cada editor.
·       Entregar una evaluación explicable: cada afirmación de la IA debe enlazarse a evidencia de la sesión.
·       Mantener la agencia humana: la IA recomienda; el entrevistador decide.
2.3 Principios
Principio
Aplicación
Evidencia antes que puntaje
No se muestra una recomendación sin eventos, fragmentos de código o hitos que la sustenten.
Candidato aislado
Los candidatos no ven ni escuchan el trabajo de otros candidatos.
Humano al mando
El entrevistador puede pausar, ayudar, anotar y anular interpretaciones de la IA.
Evaluación proporcional
No se infiere personalidad, emociones ni rasgos sensibles desde cámara o voz.
Transparencia
Consentimiento y aviso claro de qué se captura, para qué y cuánto tiempo se conserva.

 
3. Usuarios y trabajos por resolver
Rol
Necesidad principal
Trabajo por resolver
Entrevistador / reclutador técnico
Evaluar con poco tiempo y evidencia
Crear una sesión, supervisar, intervenir y comparar resultados.
Candidato / entrevistado
Resolver una prueba en un entorno claro
Entender el reto, programar, ejecutar, explicar su enfoque y pedir ayuda.
Administrador de empresa (post-MVP)
Estandarizar procesos
Gestionar plantillas, miembros, retención y auditoría.

 
3.1 Personas de referencia
Entrevistador técnico: senior engineer o tech lead con 3 a 10 entrevistas por semana. Valora una rúbrica consistente, observabilidad y velocidad para revisar candidatos.
Candidato junior: necesita un editor confiable, enunciado inequívoco y una oportunidad justa de demostrar su razonamiento aun cuando no termine toda la solución.
4. Alcance del MVP
4.1 Incluido
·       Autenticación para entrevistadores y creación de una sesión por enlace único.
·       Ingreso de hasta tres candidatos con nombre, consentimiento y prueba de dispositivos.
·       Generación de una o dos pruebas mediante un prompt estructurado y edición humana antes de publicarlas.
·       Editor aislado por candidato, con soporte inicial para Python y JavaScript/TypeScript.
·       Ejecución segura de código y casos de prueba definidos para la prueba.
·       Audio bidireccional por candidato y panel del entrevistador; cámara opcional en MVP si el proveedor lo permite sin retrasar el lanzamiento.
·       Panel de progreso con hitos, pruebas aprobadas, errores repetidos, inactividad y pedido de ayuda.
·       Registro de eventos, transcripción bajo consentimiento e informe de IA al finalizar.
·       Notas manuales, exportación de reporte y decisión final registrada por el entrevistador.
4.2 Fuera de alcance inicial
·       Contratación automatizada, ranking definitivo o rechazo automático.
·       Análisis de rostro, emociones, atención visual o rasgos de personalidad.
·       Soporte de más de tres candidatos simultáneos por entrevistador.
·       Colaboración entre candidatos o editor compartido entre ellos.
·       Navegador completo, proyectos multiarchivo complejos, acceso libre a internet o repositorios privados.
·       Integraciones ATS, SSO empresarial y plantillas corporativas avanzadas.
5. Experiencia y flujos principales
5.1 Flujo del entrevistador
1.     Crear sesión: selecciona rol, nivel, tecnologías, duración, número de pruebas y capacidades a medir.
2.     Generar prueba: redacta un prompt; el sistema propone retos, rúbrica, aspectos críticos y casos de prueba.
3.     Revisar y publicar: el entrevistador edita, aprueba y obtiene el enlace de sesión.
4.     Preparar sala: ve candidatos conectados, permisos de audio/cámara y estado de dispositivos.
5.     Iniciar sesión: cada candidato recibe el mismo set de pruebas, con workspace independiente.
6.     Supervisar: usa la vista mosaico, selecciona una pantalla y recibe alertas de progreso o bloqueo.
7.     Intervenir: abre canal de audio con un candidato, escribe una nota o marca ayuda brindada.
8.     Cerrar y revisar: finaliza la sesión, revisa informe con evidencia, ajusta notas y registra una decisión.
5.2 Flujo del candidato
9.     Abrir enlace, indicar nombre y aceptar los términos y consentimiento de captura.
10.   Completar prueba de micrófono, cámara opcional y conectividad; resolver fallos antes de entrar.
11.   Esperar en lobby hasta que el entrevistador inicie.
12.   Leer enunciado, trabajar en su editor aislado, ejecutar pruebas y explicar su razonamiento por audio.
13.   Cambiar de ejercicio si está habilitado; solicitar ayuda cuando sea necesario.
14.   Enviar solución o esperar el cierre de sesión; recibir confirmación de finalización.
5.3 Estados de una sesión
Estado
Actor que lo cambia
Comportamiento
Borrador
Entrevistador
La prueba se genera o edita; no hay acceso de candidatos.
Lista
Entrevistador
Enlace habilitado; candidatos ingresan al lobby.
En preparación
Sistema / entrevistador
Se validan dispositivos y permisos.
En vivo
Entrevistador
Editores, audio, eventos y alertas activos.
Pausada
Entrevistador
Reloj y editores bloqueados para todos o para un candidato, según configuración.
Finalizando
Entrevistador / tiempo
Se bloquean cambios, se consolidan eventos y comienza el análisis.
Cerrada
Sistema
Reporte disponible; acceso de candidatos terminado.

 
6. Requisitos funcionales
6.1 Gestión de sesión
ID
Requisito
Prioridad
Criterio de aceptación
FR-01
El entrevistador puede crear una sesión con título, rol, seniority, tecnologías, duración y máximo de tres candidatos.
Must
Se genera una URL única y la sesión queda en Borrador.
FR-02
El entrevistador puede publicar o revocar el enlace antes de iniciar.
Must
Un enlace revocado no permite nuevos ingresos.
FR-03
Cada candidato ingresa con un token de invitación o nombre validado; no puede ver a otros candidatos.
Must
No hay ruta ni evento que exponga código, audio o identidad de pares.
FR-04
El sistema muestra lobby, estado de conexión y permisos de cada candidato.
Must
El entrevistador ve listo/no listo y la causa de fallo de dispositivo.
FR-05
El entrevistador puede iniciar, pausar y cerrar una sesión.
Must
Los estados se sincronizan en menos de 2 segundos.

 
6.2 Prueba técnica
ID
Requisito
Prioridad
Criterio de aceptación
FR-06
El entrevistador describe la prueba en lenguaje natural y define número de retos (1 o 2).
Must
La generación devuelve enunciado, dificultad, rúbrica, aspectos críticos y tests.
FR-07
El entrevistador puede editar y aprobar el contenido antes de que sea visible.
Must
Ningún candidato ve contenido no publicado.
FR-08
Cada reto admite descripción, starter code, lenguaje, límite de tiempo, casos de prueba y criterios.
Must
La ejecución devuelve salida, estado y mensajes de error.
FR-09
El candidato puede guardar automáticamente, ejecutar y enviar cada reto.
Must
Una desconexión breve no pierde cambios confirmados.
FR-10
El sistema calcula el progreso del reto con señales explícitas, no solo por porcentaje de código escrito.
Must
El panel explica qué señal originó cada cambio de progreso.

 
6.3 Supervisión e intervención
ID
Requisito
Prioridad
Criterio de aceptación
FR-11
El entrevistador ve un mosaico de los candidatos y puede enfocar un workspace.
Must
El cambio de foco tarda menos de 1 segundo en condiciones normales.
FR-12
El panel muestra reto actual, tests, último evento, tiempo activo y estado de bloqueo por candidato.
Must
La información se actualiza sin recargar la página.
FR-13
El sistema alerta por inactividad configurable, errores repetidos, fallo de entorno o pedido de ayuda.
Must
Cada alerta contiene causa, hora y CTA para abrir al candidato.
FR-14
El entrevistador puede abrir canal de audio, pausar a un candidato y registrar una ayuda.
Should
El evento de ayuda queda en el timeline y en el reporte.
FR-15
El entrevistador puede escribir notas privadas ancladas a un instante de la sesión.
Must
Las notas no son visibles para el candidato y aparecen en el informe.

 
6.4 Reporte y decisión
ID
Requisito
Prioridad
Criterio de aceptación
FR-16
Al cerrar, el sistema produce un reporte individual por candidato.
Must
Incluye resumen, evidencia, rúbrica, hitos, bloqueos, ayudas y limitaciones.
FR-17
El reporte permite abrir eventos y fragmentos de código que sustentan cada hallazgo.
Must
Cada hallazgo de IA incluye al menos una evidencia o se marca como baja confianza.
FR-18
El entrevistador puede corregir, aceptar o descartar sugerencias y registrar decisión final.
Must
La decisión se audita con autor y timestamp.
FR-19
El sistema permite exportar un resumen en PDF o enlace interno.
Should
La exportación omite datos que la organización haya restringido.

 
7. Sistema de IA y evaluación
7.1 Generación de prueba
La generación se ejecuta como un asistente de diseño, no como publicación automática. Entrada mínima: rol, nivel, tecnologías, tema, duración y competencias. Salida: uno o dos retos, restricciones, código inicial, solución de referencia, casos de prueba, rúbrica y aspectos críticos. El entrevistador debe aprobar antes de publicar.
Componente
Salida esperada
Regla de calidad
Enunciado
Problema claro, ejemplos y restricciones
Debe poder resolverse en el tiempo definido.
Rúbrica
Criterios con peso y señales observables
No usar criterios vagos como “buena actitud”.
Aspectos críticos
3 a 5 condiciones técnicas claves
Deben ser verificables por código, tests o explicación.
Tests
Casos normales, borde y error esperado
Los tests ocultos no deben revelar la solución.
Guía al entrevistador
Preguntas de profundización y límites de ayuda
Debe diferenciar pistas de resolución directa.

 
7.2 Señales capturadas
·       Eventos del editor: inserción, eliminación, selección, cambios de archivo y checkpoints; se consolidan para no almacenar cada pulsación innecesariamente.
·       Eventos de ejecución: comando, duración, salida, errores, tests aprobados/fallidos y consumo de recursos.
·       Eventos de sesión: ingreso, desconexión, pausa, cambio de reto, pedido de ayuda e intervención.
·       Audio: transcripción únicamente si existe consentimiento explícito; se almacena y procesa con controles de retención.
·       Notas del entrevistador y etiquetas manuales.
7.3 Lógica de progreso y bloqueo
El estado no debe ser una lectura psicológica. Es una clasificación operativa basada en eventos observables. Cada estado incluye una razón legible para el entrevistador.
Estado
Señales de ejemplo
Acción sugerida
Avanza
Test nuevo aprobado, cambio de reto, progreso de aspecto crítico
Observar; no interrumpir.
Explorando
Cambios frecuentes sin ejecución o explicación de enfoque
Observar y comparar con el tiempo disponible.
Atascado
Inactividad > umbral, mismo error repetido, ciclos de revertir sin avance
Notificar; abrir candidato y preguntar si necesita aclaración.
Fallo de entorno
Errores de runtime o red que no dependen de la solución
Alerta de alta prioridad; ayudar y registrar incidente.
Finalizado
Tests requeridos superados o envío explícito
Revisar criterios críticos; permitir profundización.

 
7.4 Reporte de IA
Formato mínimo: resumen ejecutivo; resultado por criterio; aspectos críticos cumplidos, parciales o no observados; timeline de hitos; bloqueos y ayudas; ejemplos de código o transcripción; nivel de confianza; preguntas recomendadas de seguimiento; y una sección de limitaciones. La IA no debe emitir una recomendación de contratación única ni inferir atributos protegidos.
Guardrail. La cámara no se utiliza para puntuar ni para extraer emociones. La voz se trata como contenido de razonamiento solo cuando la persona ha consentido la transcripción; nunca como biometría, acento, estado emocional o personalidad.

 
8. Tiempo real y estados de la sesión
La plataforma necesita separar tres canales de tiempo real: presencia/control, colaboración del editor y media. El candidato recibe únicamente su propio canal de trabajo; el entrevistador se suscribe a los de todos los candidatos de su sesión.
Canal
Eventos
Objetivo de latencia
Presencia y control
join, permisos, estado, inicio, pausa, cierre, alertas
p95 < 2 s
Editor y ejecución
ediciones consolidadas, cursor, guardado, run, test result
p95 < 500 ms para actualizaciones visibles
Audio/video
stream de cada candidato y canal de intervención
Interacción natural; degradación adaptativa
Analítica
eventos normalizados, resumen incremental, alertas
No bloquear editor ni media

 
8.1 Reglas de sincronización
·       Cada evento tiene session_id, candidate_id, actor_id, timestamp de servidor, tipo y payload versionado.
·       El cliente puede operar con cola local temporal; al reconectarse, reintenta eventos idempotentes y recupera el último snapshot.
·       Los cambios de editor se persisten por checkpoints y delta; no se debe depender solo de un stream efímero.
·       Una desconexión de media no detiene automáticamente el editor. El sistema indica degradación y ofrece reconexión.
·       Las alertas se deduplican por candidato, tipo y ventana de tiempo.
9. Datos y arquitectura conceptual
9.1 Entidades principales
Entidad
Campos relevantes
Relaciones
Organization
id, nombre, políticas de retención
Tiene usuarios, sesiones y plantillas.
User
id, rol, identidad, consentimiento
Puede ser entrevistador o candidato invitado.
InterviewSession
id, estado, duración, configuración
Pertenece a organización; agrupa participantes y retos.
Participant
session_id, user/guest_id, rol, permisos, presencia
Aísla la experiencia de cada candidato.
Challenge
enunciado, lenguaje, rúbrica, tests, solución referencia
Se publica en una sesión.
Workspace
candidate_id, challenge_id, snapshot, estado
Contiene código y ejecuciones del candidato.
Event
tipo, actor, timestamp, payload, evidencia
Alimenta timeline, alertas y análisis.
EvaluationReport
criterios, hallazgos, confianza, decisión humana
Se genera por candidato y versión.

 
9.2 Arquitectura de referencia
Capa
Responsabilidad
Consideración
Web app
Panel entrevistador, lobby y workspace candidato
Web responsive; estados claros de permiso y reconexión.
API / auth
Identidad, sesiones, autorización y enlaces firmados
RBAC y validación server-side en toda acción.
Realtime gateway
Presencia, editor, alertas y eventos
Canales por sesión/candidato; autorización por suscripción.
Media provider
Audio/video WebRTC
Usar proveedor administrado al inicio para acelerar fiabilidad.
Code runner
Sandbox efímero para ejecutar tests
Sin red por defecto, límites de CPU/memoria/tiempo.
Event pipeline
Normalización, almacenamiento y análisis incremental
Cola asíncrona para no bloquear el flujo vivo.
AI services
Generación, transcripción, evaluación y resumen
Prompts versionados, evidencia enlazada y revisión humana.
Data store
Datos relacionales, snapshots y logs
Cifrado, retención configurable y borrado verificable.

 
9.3 Autorización mínima
·       Solo el entrevistador asignado y miembros autorizados de la organización pueden acceder a reportes y material de una sesión.
·       Cada candidato puede leer/escribir únicamente su workspace, su stream de medios y los retos publicados para él.
·       Un enlace de sesión debe expirar, poder revocarse y no otorgar acceso a otras sesiones.
·       Las acciones críticas (publicar, iniciar, cerrar, exportar, borrar) deben registrar auditoría.
10. Requisitos no funcionales
Área
Requisito / objetivo
Rendimiento
Panel y editor deben seguir utilizables con 3 candidatos conectados. Actualizaciones visibles p95 < 500 ms; acciones de estado p95 < 2 s.
Disponibilidad
Objetivo inicial: 99.5% mensual para funciones de sesión; degradación explícita cuando falle un servicio no crítico.
Confiabilidad
Autosave frecuente; recuperación de snapshot tras recarga/desconexión; no pérdida silenciosa de código confirmado.
Seguridad
Cifrado en tránsito y en reposo, controles de acceso por sesión, sandbox de ejecución aislado y rate limiting.
Escalabilidad
Diseño por sala/candidato para escalar sesiones horizontales. Media y runners deben poder escalar de manera independiente.
Observabilidad
Logs estructurados, trazas por session_id, métricas de media/realtime y alertas operativas sin registrar secretos.
Accesibilidad
Navegación por teclado en editor y panel, contraste adecuado, estados no expresados solo por color y transcripción cuando esté habilitada.
Compatibilidad
Últimas dos versiones de Chrome, Edge, Firefox y Safari; diagnóstico previo de navegador y dispositivos.

 
11. Privacidad, seguridad y uso responsable
11.1 Consentimiento y transparencia
·       Antes de entrar, el candidato recibe una explicación clara de datos capturados: código, eventos, ejecuciones, audio/transcripción si aplica y video si se habilita.
·       El consentimiento de audio/transcripción y cámara debe ser granular. Si una organización requiere audio para su proceso, la condición se debe comunicar antes de la sesión.
·       Se debe indicar quién accede al reporte, propósito de la evaluación, período de retención y canal para solicitar información o eliminación conforme a la política aplicable.
·       El sistema debe conservar prueba de consentimiento, versión del aviso y timestamp.
11.2 Seguridad de ejecución
·       Los contenedores de ejecución son efímeros, sin credenciales y sin red saliente por defecto.
·       Aplicar límites estrictos de CPU, memoria, disco, procesos y tiempo; destruir el entorno al finalizar la ejecución o sesión.
·       Bloquear acceso a host, metadatos cloud, sockets privilegiados y montaje de archivos no autorizados.
·       Escanear y limitar dependencias; en MVP, soportar librerías preinstaladas y versiones controladas.
11.3 Evaluación responsable
·       No usar resultados como decisión automática de empleo. Mostrar al entrevistador que debe revisar la evidencia.
·       No puntuar género, edad, origen, acento, discapacidad, apariencia, emociones ni señales biométricas.
·       Permitir que el entrevistador corrija hallazgos y documente contexto, por ejemplo, una caída de internet.
·       Monitorear discrepancias entre resultados de IA y evaluadores humanos antes de ampliar uso.
·       Solicitar revisión legal y de privacidad para cada mercado y cliente empresarial antes de producción comercial.
12. Métricas, aceptación y roadmap
12.1 Métricas de éxito
Dimensión
Métrica
Señal de éxito inicial
Activación
% de sesiones creadas que llegan a En vivo
>= 70% en pilotos
Fiabilidad
% de sesiones sin pérdida de código ni caída crítica
>= 98%
Eficiencia
Tiempo medio de preparación de prueba
Reducción >= 50% vs. preparación manual reportada
Valor de IA
% de reportes revisados que el entrevistador considera útiles
>= 70% en encuesta post-sesión
Intervención oportuna
Alertas de bloqueo atendidas antes de 2 minutos
>= 80% cuando entrevistador está disponible
Calidad
Hallazgos con evidencia verificable
100% de hallazgos mostrados

 
12.2 Criterios de salida del MVP
·       Un entrevistador puede crear, publicar e iniciar una sesión con tres candidatos en un entorno de prueba.
·       Cada candidato puede editar, ejecutar y conservar su código tras una desconexión breve.
·       El entrevistador recibe actualizaciones de todos los candidatos y puede abrir cualquiera en menos de un segundo en condiciones normales.
·       La prueba creada contiene rúbrica, aspectos críticos y casos de prueba revisables antes de publicar.
·       Al cerrar, existe un informe por candidato con al menos una evidencia por hallazgo o una marca explícita de baja confianza.
·       Los permisos impiden que un candidato acceda a datos o media de otro candidato.
·       La ejecución de código no permite red ni acceso al host fuera del sandbox.
12.3 Roadmap sugerido
Fase
Objetivo
Entregables
0. Descubrimiento (2-3 semanas)
Validar flujo y confianza
5-10 entrevistas con leads; prototipo clickable; definición de políticas de datos.
1. MVP técnico (6-8 semanas)
Resolver experiencia esencial
Sesión, enlace, lobby, editor Python/JS, runner, panel, eventos y reporte básico.
2. Piloto controlado (4 semanas)
Comprobar valor y fiabilidad
10-30 sesiones reales, calibración de alertas, revisión humana de reportes.
3. V1 empresarial
Estandarizar y ampliar
Plantillas, equipos, exportaciones, ATS, SSO, auditoría y más lenguajes.

 
13. Riesgos, dependencias y decisiones abiertas
13.1 Riesgos
Riesgo
Impacto
Mitigación
IA presenta inferencias débiles como hechos
Pérdida de confianza o decisión injusta
Evidencia obligatoria, umbral de confianza y revisión humana.
Fallas de red/audio durante entrevista
Mala experiencia y evaluación injusta
Preflight, reconexión, degradación y registro de incidente.
Sandbox insuficiente
Riesgo de seguridad
Aislamiento fuerte, sin red, límites y pruebas de seguridad antes de piloto.
Pruebas generadas con ambigüedad
Resultados poco comparables
Aprobación humana, plantillas y revisión con entrevistadores.
Sobrecarga visual para entrevistador
No se aprovecha supervisión simultánea
Mosaico simple, alertas priorizadas y límites de tres candidatos.
Retención de audio/código excesiva
Riesgo legal y reputacional
Políticas configurables, borrado y consentimiento granular.

 
13.2 Dependencias
·       Proveedor de media WebRTC o infraestructura equivalente confiable.
·       Sandbox de ejecución de código con aislamiento real y observabilidad.
·       Modelo de IA para generación/evaluación, transcripción opcional y mecanismos de versionado de prompts.
·       Almacenamiento seguro para snapshots, eventos, reportes y grabaciones si se habilitan.
·       Revisión legal, políticas de privacidad y términos de uso antes de entrevistas reales.
13.3 Decisiones abiertas
Decisión
Opciones
Recomendación inicial
¿Video en MVP?
Audio solo / audio + cámara opcional
Audio obligatorio para la dinámica; cámara opcional, sin análisis.
¿Mismo reto o variantes?
Mismo reto / banco equivalente
Mismo reto para piloto; variantes equivalentes cuando exista banco validado.
¿Acceso a internet?
Bloqueado / allowlist / libre
Bloqueado por defecto; definir modalidad explícita de entrevista abierta.
¿Transcripción?
Opt-in / obligatoria por organización
Opt-in granular en piloto; requisito solo con aviso previo y base legal aplicable.
¿Puntaje?
Numérico / rúbrica cualitativa
Rúbrica con evidencia y nivel de confianza; puntaje compuesto solo tras calibración.
¿Primer lenguaje?
Python / JS-TS / ambos
Python y JS-TS con runtime fijo y librerías controladas.

 
14. Glosario
Término
Definición
Sesión
Unidad de entrevista creada por un entrevistador y accesible mediante enlace.
Workspace
Entorno aislado de código, ejecución y eventos perteneciente a un candidato y reto.
Aspecto crítico
Condición técnica verificable que la solución debería demostrar.
Evidencia
Evento, salida, fragmento de código, test o transcripción que sustenta un hallazgo.
Bloqueo
Estado operativo basado en señales observables; no es una inferencia psicológica.
Rúbrica
Conjunto de criterios de evaluación y sus niveles o pesos.

 
 
Fin del PRD - LiveRoom AI v1.0

