package com.heaven4.infrastructure.web;

import com.heaven4.domain.identity.entity.Team;
import com.heaven4.domain.identity.entity.User;
import com.heaven4.domain.identity.entity.UserRole;
import com.heaven4.domain.identity.repository.TeamRepository;
import com.heaven4.domain.identity.repository.UserRepository;
import com.heaven4.domain.identity.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/owner/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<List<Map<String, Object>>> getAllTeams() {
        List<Team> teams = teamRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Team t : teams) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("name", t.getName());
            map.put("description", t.getDescription());

            List<Map<String, Object>> memberList = new ArrayList<>();
            if (t.getMembers() != null) {
                for (User u : t.getMembers()) {
                    if (u.getDeletedAt() == null && u.isActive()) {
                        String fullName = ((u.getFirstName() != null ? u.getFirstName() : "") + " " +
                                           (u.getLastName() != null ? u.getLastName() : "")).trim();
                        List<UserRole> roles = userRoleRepository.findByUserIdAndActiveTrue(u.getId());
                        String role = roles.isEmpty() ? "EMPLOYEE" : roles.get(0).getRole();

                        memberList.add(Map.of(
                            "id", u.getId(),
                            "displayName", !fullName.isEmpty() ? fullName : u.getPhoneNumber(),
                            "phoneNumber", u.getPhoneNumber(),
                            "role", role
                        ));
                    }
                }
            }
            map.put("members", memberList);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<Team> createTeam(@RequestBody Team team) {
        return ResponseEntity.ok(teamRepository.save(team));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<Team> updateTeam(@PathVariable Long id, @RequestBody Team updated) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        team.setName(updated.getName());
        team.setDescription(updated.getDescription());
        return ResponseEntity.ok(teamRepository.save(team));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<Map<String, String>> addMemberToTeam(@PathVariable Long teamId, @PathVariable Long userId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        team.getMembers().add(user);
        teamRepository.save(team);
        return ResponseEntity.ok(Map.of("message", "Member added to team"));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<Map<String, String>> removeMemberFromTeam(@PathVariable Long teamId, @PathVariable Long userId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        team.getMembers().removeIf(u -> u.getId().equals(userId));
        teamRepository.save(team);
        return ResponseEntity.ok(Map.of("message", "Member removed from team"));
    }
}
