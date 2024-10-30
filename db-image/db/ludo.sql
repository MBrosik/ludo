-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 06 Lip 2024, 17:05
-- Wersja serwera: 10.4.20-MariaDB
-- Wersja PHP: 8.0.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `ludo`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `game_phases`
--

CREATE TABLE `game_phases` (
  `id` int(11) NOT NULL,
  `game_state` varchar(100) COLLATE utf8_polish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

--
-- Zrzut danych tabeli `game_phases`
--

INSERT INTO `game_phases` (`id`, `game_state`) VALUES
(1, 'preparation phase'),
(2, 'game is running'),
(3, 'game is ended');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `players`
--

CREATE TABLE `players` (
  `id` int(11) NOT NULL,
  `name` text COLLATE utf8_polish_ci DEFAULT NULL,
  `ready_for_game` tinyint(1) NOT NULL DEFAULT '0',
  `last_sync` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

--
-- Zrzut danych tabeli `players`
--

INSERT INTO `players` (`id`, `name`, `ready_for_game`, `last_sync`) VALUES
(14, '2', 0, 1720276099631);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `red_player` int(11) DEFAULT NULL,
  `blue_player` int(11) DEFAULT NULL,
  `green_player` int(11) DEFAULT NULL,
  `yellow_player` int(11) DEFAULT NULL,
  `game_phase` int(11) DEFAULT NULL,
  `start_time` bigint(20) DEFAULT NULL,
  `end_time` bigint(20) DEFAULT NULL,
  `winner` int(11) DEFAULT NULL,
  `data` text COLLATE utf8_polish_ci DEFAULT NULL,
  `public` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

--
-- Zrzut danych tabeli `rooms`
--

INSERT INTO `rooms` (`id`, `red_player`, `blue_player`, `green_player`, `yellow_player`, `game_phase`, `start_time`, `end_time`, `winner`, `data`, `public`) VALUES
(10, 14, NULL, NULL, NULL, 1, 1720275883461, NULL, NULL, '', 0);

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `game_phases`
--
ALTER TABLE `game_phases`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `red player` (`red_player`),
  ADD KEY `blue player` (`blue_player`),
  ADD KEY `green player` (`green_player`),
  ADD KEY `yellow player` (`yellow_player`),
  ADD KEY `game state` (`game_phase`),
  ADD KEY `winner` (`winner`);

--
-- AUTO_INCREMENT dla zrzuconych tabel
--

--
-- AUTO_INCREMENT dla tabeli `game_phases`
--
ALTER TABLE `game_phases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT dla tabeli `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT dla tabeli `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Ograniczenia dla zrzutów tabel
--

--
-- Ograniczenia dla tabeli `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_10` FOREIGN KEY (`game_phase`) REFERENCES `game_phases` (`id`),
  ADD CONSTRAINT `rooms_ibfk_11` FOREIGN KEY (`winner`) REFERENCES `players` (`id`),
  ADD CONSTRAINT `rooms_ibfk_6` FOREIGN KEY (`red_player`) REFERENCES `players` (`id`),
  ADD CONSTRAINT `rooms_ibfk_7` FOREIGN KEY (`blue_player`) REFERENCES `players` (`id`),
  ADD CONSTRAINT `rooms_ibfk_8` FOREIGN KEY (`green_player`) REFERENCES `players` (`id`),
  ADD CONSTRAINT `rooms_ibfk_9` FOREIGN KEY (`yellow_player`) REFERENCES `players` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
