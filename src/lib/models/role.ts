export enum Role{
    Admin = "admin",
    Author = "author",
    Reviewer = "reviewer"
}

export function getRoleColor(role: Role) {
    switch (role) {
      case Role.Admin: return 'badge-error';
      case Role.Author: return 'badge-info';
      case Role.Reviewer: return 'badge-success';
      default: return 'badge-ghost';
    }
  }

export function getRoleAbbreviation(role: Role) {
    switch (role) {
      case Role.Admin: return 'Ad';
      case Role.Author: return 'Au';
      case Role.Reviewer: return 'Re';
      default: return '';
    }
  }

export function getRoleInitial(role: Role) {
    switch (role) {
      case Role.Admin: return 'AD';
      case Role.Author: return 'AU';
      case Role.Reviewer: return 'RE';
      default: return '??';
    }
  }