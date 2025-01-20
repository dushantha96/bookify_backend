-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 09, 2025 at 04:51 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hotel_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `roomId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `roomName` varchar(255) NOT NULL,
  `roomType` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `bookingDate` date NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `roomId`, `userId`, `roomName`, `roomType`, `description`, `bookingDate`, `createdAt`) VALUES
(1, 5, 5, 'Gejsj', 'Double Deluxe', 'Vshsn', '2025-01-08', '2025-01-08 13:52:17');

-- --------------------------------------------------------

--
-- Table structure for table `complains`
--

CREATE TABLE `complains` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `userId` int(11) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `roomNumber` int(11) NOT NULL,
  `comment` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complains`
--

INSERT INTO `complains` (`id`, `userId`, `userName`, `roomNumber`, `comment`, `createdAt`) VALUES
(1, 5, 'T1', 1, 'Friday ග්', '2025-01-08 15:26:22'),
(2, 5, 'T1', 1, 'B', '2025-01-08 15:40:22'),
(3, 5, 'T1', 1, 'Rydgd', '2025-01-08 15:53:11'),
(4, 5, 'T1', 1, 'Fhfhhf', '2025-01-08 15:53:14'),
(5, 5, 'T1', 1, 'Vjjgg', '2025-01-08 15:53:18'),
(6, 5, 'T1', 1, 'Chchjf', '2025-01-08 15:53:23'),
(7, 5, 'T1', 1, 'Fufjfjf', '2025-01-08 15:53:27'),
(8, 5, 'T1', 1, 'Ufufjfufuf', '2025-01-08 15:53:32'),
(9, 5, 'T1', 1, 'Fjvjvjc', '2025-01-08 15:53:35'),
(10, 5, 'T1', 1, 'Gucjfhvuf', '2025-01-08 15:53:41'),
(11, 5, 'T1', 1, 'Jfjgf', '2025-01-08 15:53:45');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `imageUrl1` varchar(255) DEFAULT NULL,
  `imageUrl2` varchar(255) DEFAULT NULL,
  `imageUrl3` varchar(255) DEFAULT NULL,
  `isBooked` tinyint(1) NOT NULL DEFAULT 0,
  `bookedBy` varchar(255) DEFAULT NULL,
  `bookedDate` date DEFAULT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `type`, `status`, `description`, `imageUrl1`, `imageUrl2`, `imageUrl3`, `isBooked`, `bookedBy`, `bookedDate`, `price`) VALUES
(1, 'Red Rose', 'Deluxe', 'Available', 'A spacious deluxe room.', '/uploads/1735660786064-458526623.jpg', '/uploads/1735660786064-784023013.jpg', '/uploads/1735660786066-828792383.jpg', 1, '2', NULL, 300.00),
(2, 'Red Rose', 'Deluxe', 'Available', 'A spacious deluxe room.', '/uploads/1735660821646-736582235.jpg', '/uploads/1735660821646-181300435.jpg', '/uploads/1735660821647-172526806.jpg', 1, '2', NULL, 500.00),
(3, 'Tyy', 'Double Deluxe', 'Available', 'Fhhhdr', '/uploads/1735819764202-425341769.jpg', '/uploads/1735819764229-648273892.jpg', '/uploads/1735819764253-536765486.jpg', 0, 'null', NULL, 200.00),
(4, 'Evev', 'Double Deluxe', 'Available', 'Ffvv', '/uploads/1735819991022-123850371.jpg', '/uploads/1735819991089-888657758.jpg', '/uploads/1735819991121-729885611.jpg', 0, 'null', NULL, 100.00),
(5, 'Gejsj', 'Double Deluxe', 'Unavailable', 'Vshsn', '/uploads/1735820146386-882130470.jpg', '/uploads/1735820146425-300028216.jpg', '/uploads/1735820146460-355791922.jpg', 1, '5', '2025-01-08', 3000.00),
(6, 'Hsjs', 'Double Deluxe', 'Available', 'Gshsj', '/uploads/1736337699551-143514408.jpg', '/uploads/1736337699619-601924324.jpg', '/uploads/1736337699668-443126179.jpg', 0, 'null', NULL, 250.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `userType` enum('Customer','Admin') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `userType`) VALUES
(1, 'Tha', 'Test@test.com', '$2b$10$fOvWBcanojivtmhMnxitpOdKEzgbEVc45caXONuUcm5.7zZkHXbxu', 'Customer'),
(3, 'That', 'Test@test.com', '$2b$10$XPL1ebrguj/ffpYocEVJu.l8yDLKmqf.ogWsQlsHXVeZOxfie6UFq', 'Customer'),
(4, 'Thatt', 'Test@test.com', '$2b$10$BXsrT5BUobEIavG65Pu6EOwR4/WYUi46skc4yEznibpaTlaLShcT.', 'Customer'),
(5, 'T1', 'T1@test.com', '$2b$10$EqUYTuEWy68HRUyO5gvtI.VVqHYl3GUEjAc8Nwcv2U1R2xCEBkVA6', 'Admin'),
(6, 'T2', 'T2@test.com', '$2b$10$6Qre89ZqNZ.Gtw7LIk.SR.TiqEbKjB3XbN7aE0NankXchXt1jUEGm', 'Customer');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `roomId` (`roomId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `complains`
--
ALTER TABLE `complains`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `complains`
--
ALTER TABLE `complains`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
