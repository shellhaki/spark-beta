import "./globals.css";

export const metadata = {
	title: "SparkDB Beta",
	description: "Apply for the SparkDB beta programme."
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
