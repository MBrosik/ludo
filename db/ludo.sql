-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Host: mysql.ct8.pl
-- Czas generowania: 19 Cze 2022, 22:38
-- Wersja serwera: 8.0.29
-- Wersja PHP: 7.3.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `m22177_chinczyk`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `game_phases`
--

CREATE TABLE `game_phases` (
  `id` int NOT NULL,
  `game_state` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8_polish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_polish_ci;

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
  `id` int NOT NULL,
  `name` text CHARACTER SET utf8mb3 COLLATE utf8_polish_ci,
  `ready_for_game` tinyint(1) NOT NULL,
  `last_sync` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_polish_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `rooms`
--

CREATE TABLE `rooms` (
  `id` int NOT NULL,
  `red_player` int DEFAULT NULL,
  `blue_player` int DEFAULT NULL,
  `green_player` int DEFAULT NULL,
  `yellow_player` int DEFAULT NULL,
  `game_phase` int DEFAULT NULL,
  `start_time` bigint DEFAULT NULL,
  `end_time` bigint DEFAULT NULL,
  `winner` int DEFAULT NULL,
  `data` text CHARACTER SET utf8mb3 COLLATE utf8_polish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_polish_ci;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT dla tabeli `players`
--
ALTER TABLE `players`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT dla tabeli `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
