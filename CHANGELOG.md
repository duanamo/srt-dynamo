# Changelog

All notable changes to the Status Report Tracker are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- Create, view, edit, and delete users, projects, and status reports.
- A dashboard summarizing total projects, active projects, reports in the current month, and report counts by overall status (Green, Yellow, Red).
- Filter status reports by project, author, reporting period, and overall status.
- Deletion safeguards: a user or project that is still referenced by a status report (or, for a user, still owns a project) can't be deleted, and the app explains what to remove first.
- Sample data on first load, with controls to reset to the sample data or clear everything. All data is stored locally in your browser.
