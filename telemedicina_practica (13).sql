-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-10-2026 a las 15:15:57
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `telemedicina_practica`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(1, 'Estetoscopios'),
(2, 'Termómetros');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gestores`
--

CREATE TABLE `gestores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `usuario` varchar(25) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gestores`
--

INSERT INTO `gestores` (`id`, `nombre`, `apellidos`, `usuario`, `password`) VALUES
(1, 'Anita', 'Gomez', 'ana', '1234'),
(2, 'Juan Carlos', 'Fisica', 'jc', '12345');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modelos`
--

CREATE TABLE `modelos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `categoria` int(11) NOT NULL,
  `horas_maximas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modelos`
--

INSERT INTO `modelos` (`id`, `nombre`, `categoria`, `horas_maximas`) VALUES
(1, 'Modelo A', 1, 8),
(2, 'Modelo B', 2, 5),
(3, 'Modelo C', 2, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recursos`
--

CREATE TABLE `recursos` (
  `id` int(11) NOT NULL,
  `modelo` int(11) NOT NULL,
  `ubicacion` int(11) NOT NULL,
  `numero_serie` varchar(50) NOT NULL,
  `estado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recursos`
--

INSERT INTO `recursos` (`id`, `modelo`, `ubicacion`, `numero_serie`, `estado`) VALUES
(1, 1, 1, 'SN001', 0),
(2, 2, 1, 'SN002', 0),
(3, 2, 1, 'SN003', 0),
(4, 2, 1, 'SN004', 1),
(5, 2, 1, 'SN1999', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenyas`
--

CREATE TABLE `resenyas` (
  `id` int(11) NOT NULL,
  `recurso` int(11) NOT NULL,
  `sanitario` int(11) NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `valor` int(11) NOT NULL,
  `descripcion` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resenyas`
--

INSERT INTO `resenyas` (`id`, `recurso`, `sanitario`, `fecha`, `valor`, `descripcion`) VALUES
(1, 1, 1, '2026-09-24 18:56:08', 5, 'Muy bueno'),
(2, 1, 1, '2026-09-29 13:41:58', 1, 'mal');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL,
  `recurso` int(11) NOT NULL,
  `sanitario` int(11) NOT NULL,
  `horas_estimadas` int(11) NOT NULL,
  `fecha_peticion` datetime DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id`, `recurso`, `sanitario`, `horas_estimadas`, `fecha_peticion`, `fecha_inicio`, `fecha_fin`) VALUES
(1, 1, 1, 4, '2026-09-24 18:35:47', '2026-09-29 13:30:58', '2026-09-29 13:31:00'),
(2, 1, 1, 3, '2026-09-29 14:06:51', '2026-09-29 14:06:51', '2026-10-13 09:09:55'),
(3, 1, 1, 4, '2026-09-29 14:06:55', '2026-10-13 09:38:11', '2026-10-13 09:39:48'),
(4, 1, 1, 5, '2026-09-29 14:07:05', '2026-10-13 15:17:40', NULL),
(5, 2, 1, 4, '2026-09-29 14:07:15', '2026-09-29 14:07:15', NULL),
(6, 1, 1, 3, '2026-10-13 15:13:29', '2026-10-13 15:13:29', '2026-10-13 15:16:11'),
(7, 1, 1, 4, '2026-10-13 15:13:42', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sanitarios`
--

CREATE TABLE `sanitarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sanitarios`
--

INSERT INTO `sanitarios` (`id`, `nombre`, `apellidos`, `usuario`, `password`) VALUES
(1, 'Ruben', 'Garcia', 'rub', '1234'),
(2, 'Aldrin', 'Guzman', 'ald', '12345'),
(3, 'pepe', 'pepe', 'pepe', 'pepe');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `nombre`) VALUES
(1, 'Sala 1'),
(2, 'Almacén');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `gestores`
--
ALTER TABLE `gestores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categorias en modelos` (`categoria`);

--
-- Indices de la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `modelo en recursos` (`modelo`),
  ADD KEY `ubicacion en recusos` (`ubicacion`);

--
-- Indices de la tabla `resenyas`
--
ALTER TABLE `resenyas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recurso en resenya` (`recurso`),
  ADD KEY `sanitario en resenya` (`sanitario`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recurso en reserva` (`recurso`),
  ADD KEY `sanitario en reserva` (`sanitario`);

--
-- Indices de la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `gestores`
--
ALTER TABLE `gestores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `modelos`
--
ALTER TABLE `modelos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `recursos`
--
ALTER TABLE `recursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `resenyas`
--
ALTER TABLE `resenyas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3503;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD CONSTRAINT `categorias en modelos` FOREIGN KEY (`categoria`) REFERENCES `categorias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD CONSTRAINT `modelo en recursos` FOREIGN KEY (`modelo`) REFERENCES `modelos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ubicacion en recusos` FOREIGN KEY (`ubicacion`) REFERENCES `ubicaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `resenyas`
--
ALTER TABLE `resenyas`
  ADD CONSTRAINT `recurso en resenya` FOREIGN KEY (`recurso`) REFERENCES `recursos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sanitario en resenya` FOREIGN KEY (`sanitario`) REFERENCES `sanitarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `recurso en reserva` FOREIGN KEY (`recurso`) REFERENCES `recursos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sanitario en reserva` FOREIGN KEY (`sanitario`) REFERENCES `sanitarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
