/**
 * Lightweight i18n system for CryptoBlocks.
 *
 * Block labels, tooltips, and UI text are translated based on the
 * user's language setting. Generated code stays in English — only
 * the visual interface changes.
 */

export type Locale = 'en' | 'es'

let currentLocale: Locale = 'en'

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale): void {
  currentLocale = locale
}

export function initLocale(): void {
  try {
    const settings = JSON.parse(localStorage.getItem('cryptoblocks-settings') || '{}')
    if (settings.locale && ['en', 'es'].includes(settings.locale)) {
      currentLocale = settings.locale
    }
  } catch {}
}

// Translation lookup — returns the translation or falls back to the key
export function t(key: string): string {
  if (currentLocale === 'en') return key
  const dict = translations[currentLocale]
  return dict?.[key] || key
}

// Block label lookup — translates block names shown in the toolbox
export function blockLabel(name: string): string {
  if (currentLocale === 'en') {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
  const dict = blockLabels[currentLocale]
  return dict?.[name] || name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// Block tooltip lookup
export function blockTooltip(name: string, fallback: string): string {
  if (currentLocale === 'en') return fallback
  const dict = blockTooltips[currentLocale]
  return dict?.[name] || fallback
}

// === Translation dictionaries ===

const translations: Record<string, Record<string, string>> = {
  es: {
    // Toolbar
    'File': 'Archivo',
    'Build': 'Construir',
    'Menu': 'Menú',
    'Run': 'Ejecutar',
    'Stop': 'Detener',
    'Peek Code': 'Ver Código',
    'Hide Code': 'Ocultar Código',
    'Sign In': 'Iniciar Sesión',
    'Save .blocks': 'Guardar .blocks',
    'Load .blocks': 'Cargar .blocks',
    'Import as Block': 'Importar como Bloque',
    'Import from Scratch': 'Importar de Scratch',
    'Save Checkpoint': 'Guardar Punto',
    'History': 'Historial',
    'Settings': 'Configuración',
    'Tutorial': 'Tutorial',
    'Export as HTML': 'Exportar como HTML',
    'Export as App (PWA)': 'Exportar como App (PWA)',
    'Copy Embed Snippet': 'Copiar Código Embed',
    'Publish to GitHub': 'Publicar en GitHub',
    'Share Link': 'Compartir Enlace',
    'Clear Workspace': 'Limpiar Espacio',
    'Create Block': 'Crear Bloque',
    'Code to Blocks': 'Código a Bloques',
    'Sprite Editor': 'Editor de Sprites',
    'Level Editor': 'Editor de Niveles',
    // Menu items
    'Code with Friends': 'Codear con Amigos',
    'Shareplace': 'Shareplace',
    'Leaderboard': 'Tabla de Líderes',
    'Daily Challenge': 'Desafío Diario',
    'Stats': 'Estadísticas',
    'Dashboard': 'Panel',
    'Profile & Settings': 'Perfil y Configuración',
    'Classrooms': 'Aulas',
    'Learn JavaScript': 'Aprender JavaScript',
    'Examples': 'Ejemplos',
    'Challenges': 'Desafíos',
    'Blocksets': 'Blocksets',
    'Code Golf': 'Code Golf',
    'Code Lab': 'Code Lab',
    // Categories
    'Basics': 'Básicos',
    'Math': 'Matemáticas',
    'Text': 'Texto',
    'Logic': 'Lógica',
    'Lists': 'Listas',
    'Data': 'Datos',
    'Database': 'Base de Datos',
    'Web': 'Web',
    'Games': 'Juegos',
    'Sound': 'Sonido',
    'Art': 'Arte',
    'Crypto': 'Criptografía',
    'AI': 'IA',
    'Hardware': 'Hardware',
    'micro:bit': 'micro:bit',
    'Pen': 'Pluma',
    'Testing': 'Pruebas',
    'Vision': 'Visión',
    'Functions': 'Funciones',
    'Events': 'Eventos',
    'HTML': 'HTML',
    'Libraries': 'Librerías',
    'Values': 'Valores',
    '???': '???',
    'My Blocks': 'Mis Bloques',
    // Output panel
    'Console': 'Consola',
    'Canvas': 'Lienzo',
    'Preview': 'Vista Previa',
    'Hit Play to run your blocks': 'Presiona Ejecutar para correr tus bloques',
    // Common
    'Score': 'Puntuación',
    'blocks': 'bloques',
    'likes': 'me gusta',
    'downloads': 'descargas',
    'projects': 'proyectos',
    'Your Dashboard': 'Tu Panel',
  },
}

const blockLabels: Record<string, Record<string, string>> = {
  es: {
    // Basics
    'print': 'Imprimir',
    'do': 'Hacer',
    'ask': 'Preguntar',
    'alert': 'Alerta',
    'wait': 'Esperar',
    'set_global': 'Establecer Variable',
    'get_global': 'Obtener Variable',
    'console_table': 'Tabla en Consola',
    // Math
    'add': 'Sumar',
    'subtract': 'Restar',
    'multiply': 'Multiplicar',
    'divide': 'Dividir',
    'modulo': 'Módulo',
    'random_number': 'Número Aleatorio',
    'round': 'Redondear',
    'absolute': 'Valor Absoluto',
    'power': 'Potencia',
    'square_root': 'Raíz Cuadrada',
    'minimum': 'Mínimo',
    'maximum': 'Máximo',
    // Text
    'join_text': 'Unir Texto',
    'text_length': 'Longitud de Texto',
    'uppercase': 'Mayúsculas',
    'lowercase': 'Minúsculas',
    'contains_text': 'Contiene Texto',
    'replace_text': 'Reemplazar Texto',
    'split_text': 'Dividir Texto',
    'char_at': 'Carácter En',
    'trim_text': 'Recortar Texto',
    'substring': 'Subcadena',
    // Logic
    'equals': 'Es Igual',
    'not_equals': 'No Es Igual',
    'greater_than': 'Mayor Que',
    'less_than': 'Menor Que',
    'and': 'Y',
    'or': 'O',
    'not': 'No',
    // Lists
    'create_list': 'Crear Lista',
    'add_to_list': 'Agregar a Lista',
    'get_from_list': 'Obtener de Lista',
    'list_length': 'Longitud de Lista',
    'list_contains': 'Lista Contiene',
    'remove_from_list': 'Eliminar de Lista',
    'sort_list': 'Ordenar Lista',
    'reverse_list': 'Invertir Lista',
    'index_of': 'Índice De',
    'map_list': 'Mapear Lista',
    // Data
    'create_object': 'Crear Objeto',
    'set_property': 'Establecer Propiedad',
    'get_property': 'Obtener Propiedad',
    'object_keys': 'Claves del Objeto',
    'object_value': 'Valor del Objeto',
    'to_json': 'A JSON',
    'from_json': 'Desde JSON',
    // Games
    'create_sprite': 'Crear Sprite',
    'move_sprite': 'Mover Sprite',
    'set_sprite_position': 'Posición del Sprite',
    'get_sprite_x': 'Sprite X',
    'get_sprite_y': 'Sprite Y',
    'sprites_touching': 'Sprites Tocándose',
    'remove_sprite': 'Eliminar Sprite',
    'draw_all_sprites': 'Dibujar Sprites',
    'set_score': 'Establecer Puntuación',
    'get_score': 'Obtener Puntuación',
    'set_gravity': 'Establecer Gravedad',
    'add_platform': 'Agregar Plataforma',
    'set_sprite_velocity': 'Velocidad del Sprite',
    'sprite_jump': 'Saltar',
    'is_sprite_on_ground': 'En el Suelo',
    'physics_step': 'Paso de Física',
    'set_camera': 'Establecer Cámara',
    'camera_follow': 'Cámara Seguir',
    'add_background': 'Agregar Fondo',
    'sprite_editor_image': 'Imagen del Editor',
    'spawn_random_platform': 'Generar Plataforma',
    'spawn_pipe_pair': 'Generar Tubos',
    'remove_offscreen_platforms': 'Eliminar Fuera de Pantalla',
    'start_tetris': 'Iniciar Tetris',
    'start_maze': 'Iniciar Laberinto',
    'start_pokemon': 'Iniciar Pokémon',
    // Gamepad
    'gamepad_connected': 'Control Conectado',
    'gamepad_button_a': 'Botón A',
    'gamepad_button_b': 'Botón B',
    'gamepad_button_x': 'Botón X',
    'gamepad_button_y': 'Botón Y',
    'gamepad_dpad_up': 'D-pad Arriba',
    'gamepad_dpad_down': 'D-pad Abajo',
    'gamepad_dpad_left': 'D-pad Izquierda',
    'gamepad_dpad_right': 'D-pad Derecha',
    'gamepad_left_stick_x': 'Joystick Izq X',
    'gamepad_left_stick_y': 'Joystick Izq Y',
    'gamepad_right_stick_x': 'Joystick Der X',
    'gamepad_right_stick_y': 'Joystick Der Y',
    // Sound
    'play_tone': 'Tocar Nota',
    'play_drum': 'Tocar Tambor',
    'set_tempo': 'Establecer Tempo',
    'set_instrument': 'Establecer Instrumento',
    // Art
    'set_canvas': 'Establecer Lienzo',
    'draw_rect': 'Dibujar Rectángulo',
    'draw_circle': 'Dibujar Círculo',
    'draw_line': 'Dibujar Línea',
    'draw_text': 'Dibujar Texto',
    'set_fill_color': 'Color de Relleno',
    // AI
    'create_classifier': 'Crear Clasificador',
    'add_example': 'Agregar Ejemplo',
    'classify': 'Clasificar',
    'analyze_sentiment': 'Analizar Sentimiento',
    'train_text_generator': 'Entrenar Generador',
    'generate_text': 'Generar Texto',
    'find_similar': 'Encontrar Similar',
    'add_data_point': 'Agregar Dato',
    'predict_number': 'Predecir Número',
    'ai_summary': 'Resumen IA',
    'ai_say': 'Decir',
    'ai_say_and_wait': 'Decir y Esperar',
    'ai_stop_speaking': 'Dejar de Hablar',
    'ai_listen': 'Escuchar',
    'ai_start_microphone': 'Iniciar Micrófono',
    'ai_microphone_volume': 'Volumen del Micrófono',
    // Vision
    'start_camera': 'Iniciar Cámara',
    'capture_frame': 'Capturar Imagen',
    'classify_camera': 'Clasificar Cámara',
    'classify_image': 'Clasificar Imagen',
    'start_hand_tracking': 'Rastrear Manos',
    'hand_count': 'Cantidad de Manos',
    'index_finger_x': 'Dedo Índice X',
    'index_finger_y': 'Dedo Índice Y',
    'is_pinching': 'Pellizcando',
    'fingers_up': 'Dedos Arriba',
    // micro:bit
    'microbit_show_text': 'Mostrar Texto',
    'microbit_show_icon': 'Mostrar Ícono',
    'microbit_clear': 'Limpiar Pantalla',
    'microbit_play_tone': 'Tocar Tono',
    'microbit_set_led': 'Establecer LED',
    'microbit_temperature': 'Temperatura',
    'microbit_light_level': 'Nivel de Luz',
    'microbit_accel_x': 'Acelerómetro X',
    'microbit_accel_y': 'Acelerómetro Y',
    'microbit_accel_z': 'Acelerómetro Z',
    'microbit_compass_heading': 'Dirección Brújula',
    'microbit_button_pressed': 'Botón Presionado',
    'microbit_set_servo': 'Establecer Servo',
    'microbit_drive': 'Conducir',
    'microbit_is_connected': 'micro:bit Conectado',
    // Web
    'http_get': 'Obtener HTTP',
    'http_post': 'Enviar HTTP',
    'get_json_field': 'Campo JSON',
    // Crypto
    'hash_text': 'Hash de Texto',
    'base64_encode': 'Codificar Base64',
    'base64_decode': 'Decodificar Base64',
    // Control flow (native blocks)
    'if': 'Si',
    'if_else': 'Si / Sino',
    'repeat': 'Repetir',
    'while': 'Mientras',
    'loop_index': 'Índice del Bucle',
  },
}

const blockTooltips: Record<string, Record<string, string>> = {
  es: {
    'print': 'Imprimir un mensaje en la consola',
    'wait': 'Esperar un número de segundos',
    'set_global': 'Guardar un valor en una variable',
    'get_global': 'Obtener el valor de una variable',
    'create_sprite': 'Crear un sprite con nombre, posición y apariencia',
    'move_sprite': 'Mover un sprite por una cantidad',
    'sprites_touching': '¿Se están tocando dos sprites?',
    'draw_all_sprites': 'Dibujar todos los sprites en el lienzo',
    'set_gravity': 'Establecer qué tan rápido caen los sprites',
    'physics_step': 'Aplicar gravedad y colisiones',
    'sprite_jump': 'Hacer que un sprite salte',
    'camera_follow': 'Centrar la cámara en un sprite',
  },
}
