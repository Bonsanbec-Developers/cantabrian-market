Cantabrian Market: arquitectura y funcionamiento técnico

Cantabrian Market es una aplicación web integral para la venta en línea de productos, diseñada bajo una arquitectura serverless moderna que combina SvelteKit como framework de interfaz con Supabase como backend como servicio. El sistema está completamente desplegado en la nube —el frontend en Vercel y la base de datos, autenticación y almacenamiento en Supabase—, por lo que no requiere ejecución local ni instalación adicional para operar: cualquier usuario puede acceder desde un navegador moderno y ejecutar todas las operaciones desde la web.

El objetivo de este proyecto es ofrecer una solución funcional y modular que abarque el ciclo completo de comercio electrónico: exploración del catálogo, autenticación de usuarios, administración de carrito, procesamiento de pago simulado y registro de órdenes, todo gestionado desde una interfaz coherente y reactiva.

⸻

Arquitectura general

En el extremo del cliente se encuentra SvelteKit, que actúa como el núcleo del frontend. Está implementado con TailwindCSS para el diseño responsivo y con stores de Svelte para manejar el estado global —carrito, sesión, filtros y productos—. Cada operación del usuario se traduce en una llamada a la API de Supabase, la cual se comunica con el motor de base de datos PostgreSQL mediante funciones RPC y políticas de seguridad definidas.

La capa de backend está provista íntegramente por Supabase, que concentra tres servicios fundamentales:
	1.	Auth, para la gestión de usuarios mediante correo y contraseña.
	2.	Database, que almacena las entidades productos, carritos y ordenes.
	3.	Storage, que guarda las imágenes de los productos en un bucket con políticas de acceso restringido.

El flujo de datos es bidireccional pero controlado: el cliente nunca accede directamente a la base de datos, sino que lo hace a través de las interfaces seguras que expone Supabase. De esta forma se mantiene una separación entre la capa de presentación y la persistencia, reduciendo el riesgo de manipulación o pérdida de datos.

⸻

Flujo funcional de datos

El recorrido de información inicia cuando el usuario accede a la página principal. SvelteKit ejecuta una llamada select('*') sobre la tabla productos, obteniendo el catálogo completo y almacenándolo en un store reactivo. Cada producto contiene su id, nombre, descripcion, precio, imagen y el publicador (UUID del usuario que lo creó). Estos datos se muestran en tarjetas visuales que permiten agregar o quitar productos del carrito en tiempo real.

Cuando un usuario inicia sesión o se registra, Supabase Auth genera un token de sesión que se conserva en el cliente y se utiliza para autenticar las operaciones posteriores. Gracias a este contexto (auth.uid()), cada llamada al backend sabe quién es el usuario activo y puede aplicar las políticas de Row Level Security correspondientes.

El carrito de compras se gestiona en la tabla carritos, donde cada fila asocia el id del usuario autenticado con el producto_id y la cantidad. Desde el frontend, agregar o quitar productos ejecuta operaciones insert, update o delete sobre esa tabla mediante la API de Supabase.

Durante el pago, la aplicación invoca el procedimiento almacenado pagar(numero_tarjeta, fecha_expiracion, cvv), que encapsula la lógica del cobro simulado dentro del servidor. Esta función realiza tres tareas:
	1.	Calcula el total del carrito del usuario.
	2.	Genera un saldo aleatorio y valida si es suficiente para completar la compra.
	3.	Si lo es, inserta las filas correspondientes en ordenes (con el campo pago reflejando el monto total) y vacía el carrito.

La validación del formato de tarjeta y fecha se realiza desde el frontend, de modo que solo se permiten datos coherentes antes de llamar al RPC.

El resultado es una tabla ordenes que consolida el historial de compras, con referencia al usuario, al producto y al valor total pagado. La página de pedidos consulta esta tabla, hace un join con productos y calcula el precio unitario retroactivamente a partir del total y la cantidad, preservando la consistencia incluso si los precios cambian después.

⸻

Publicación de productos e integración con almacenamiento

Los usuarios autenticados pueden publicar nuevos artículos a través de la interfaz /publicar. Este flujo incluye dos componentes: la subida de imagen y el registro del producto.

Cuando el usuario selecciona un archivo, el frontend lo sube al bucket productos dentro de Supabase Storage. La política de seguridad upload_own_folder_only garantiza que solo pueda escribir dentro de un directorio que coincide con su UID, evitando la sobrescritura de archivos ajenos. Una vez subida la imagen, se obtiene su URL pública, que se envía al procedimiento remoto publicar_producto(nombre, descripcion, precio, imagen).

Este RPC inserta una nueva fila en productos, con el campo publicador igual al identificador del usuario autenticado (auth.uid()), y devuelve el id del nuevo registro. El frontend usa ese identificador para redirigir automáticamente al usuario a la página del producto recién publicado.

⸻

Seguridad y despliegue en la nube

El sistema aplica Row Level Security (RLS), lo que significa que cada operación SQL se filtra según la identidad del usuario autenticado. Nadie puede modificar o leer datos ajenos. Supabase gestiona tanto las claves API como los contextos de sesión, por lo que el frontend no necesita un servidor intermedio: todo el acceso es directo pero autenticado.

En cuanto al despliegue, Vercel aloja el frontend como aplicación estática dinámica. Esto implica que el código de SvelteKit se compila y se distribuye globalmente a través de CDN, ofreciendo tiempos de carga mínimos y alta disponibilidad. Todo el backend (base de datos, almacenamiento y autenticación) reside en los servidores de Supabase, accesibles mediante HTTPS.

Por tanto, Cantabrian Market no requiere ningún entorno local: no hay necesidad de Node.js, PostgreSQL ni configuraciones manuales en el equipo del usuario. La totalidad del procesamiento y la persistencia ocurre en la nube, bajo arquitectura serverless.

⸻

Valor técnico y conclusiones

Cantabrian Market demuestra cómo un sistema completo de comercio electrónico puede implementarse utilizando herramientas modernas de desarrollo rápido sin infraestructura propia. La combinación de SvelteKit + Supabase permite cubrir todas las capas —interfaz, autenticación, base de datos, almacenamiento y lógica de negocio— con un grado alto de coherencia, seguridad y mantenibilidad.

El flujo de datos, como se observa en el diagrama, mantiene una dirección clara y controlada: el cliente ejecuta peticiones autenticadas, Supabase valida y ejecuta lógica dentro de funciones seguras, y los resultados se reflejan inmediatamente en la interfaz.

Esta separación de responsabilidades garantiza escalabilidad y portabilidad: el mismo código podría ejecutarse en cualquier entorno conectado, sin más que cambiar las claves de conexión.

En síntesis, Cantabrian Market es un ejemplo de arquitectura 100% online, donde el frontend actúa como cliente inteligente y Supabase como backend unificado, conformando una plataforma sólida, reproducible y profesionalmente estructurada.